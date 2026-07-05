package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"berty.tech/go-orbit-db/accesscontroller"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/iface"

	"github.com/ipfs/kubo/client/rpc"
	coreiface "github.com/ipfs/kubo/core/coreiface"
	ma "github.com/multiformats/go-multiaddr"
)

// dbAddrFile is the filename used to persist the database address
// inside the data directory, so subsequent runs can find the same DB.
const dbAddrFile = "dbaddr"

// Client provides a high-level API for OrbitDB document store operations,
// similar to the JavaScript orbitdb.connect() / put() / get() / all() pattern.
type Client struct {
	ctx     context.Context
	cancel  context.CancelFunc
	api     coreiface.CoreAPI
	orbitDB iface.OrbitDB
	db      iface.DocumentStore
	dbName  string
	dbAddr  string
}

// NewClient creates a new Client by connecting to a local Kubo IPFS daemon
// via its API multiaddress (e.g. "/ip4/127.0.0.1/tcp/5001").
//
// Parameters:
//   - ctx: parent context
//   - kuboMultiAddr: the multiaddress of the Kubo RPC API (e.g. "/ip4/127.0.0.1/tcp/5001")
//   - dbName: the name of the OrbitDB document database to open/create
//   - dir: the local directory for database storage (e.g. "./go-orbitdb-data")
func NewClient(ctx context.Context, kuboMultiAddr string, dbName string, dir string) (*Client, error) {
	ctx, cancel := context.WithCancel(ctx)

	// 1. Parse the multiaddress and connect to the Kubo daemon
	maddr, err := ma.NewMultiaddr(kuboMultiAddr)
	if err != nil {
		cancel()
		return nil, fmt.Errorf("invalid kubo multiaddress: %w", err)
	}

	api, err := rpc.NewApi(maddr)
	if err != nil {
		cancel()
		return nil, fmt.Errorf("unable to connect to kubo daemon: %w", err)
	}

	// 2. Create the OrbitDB instance
	orbitDB, err := orbitdb.NewOrbitDB(ctx, api, &orbitdb.NewOrbitDBOptions{
		Directory: &dir,
	})
	if err != nil {
		cancel()
		return nil, fmt.Errorf("unable to create orbitdb: %w", err)
	}

	// 3. Check if we already have a persisted database address
	addrFile := filepath.Join(dir, dbAddrFile)
	persistedAddr, err := os.ReadFile(addrFile)

	var docStore iface.DocumentStore

	if err == nil && len(persistedAddr) > 0 {
		// 3a. Address exists → open the existing database
		dbAddress := string(persistedAddr)
		var s iface.Store
		s, err = orbitDB.Open(ctx, dbAddress, &iface.CreateDBOptions{
			Directory: &dir,
		})
		if err != nil {
			cancel()
			orbitDB.Close()
			return nil, fmt.Errorf("unable to open existing document store at %s: %w", dbAddress, err)
		}

		var ok bool
		docStore, ok = s.(iface.DocumentStore)
		if !ok {
			cancel()
			orbitDB.Close()
			return nil, fmt.Errorf("unable to cast store to document store")
		}

		// Load existing entries from IPFS
		if err := docStore.Load(ctx, -1); err != nil {
			cancel()
			orbitDB.Close()
			return nil, fmt.Errorf("unable to load existing document store: %w", err)
		}
	} else {
		// 3b. No persisted address → create a new database
		access := accesscontroller.NewEmptyManifestParams()
		access.SetType("ipfs")
		access.SetAccess("write", []string{"*"})

		docStore, err = orbitDB.Docs(ctx, dbName, &iface.CreateDBOptions{
			AccessController: access,
			Directory:        &dir,
		})
		if err != nil {
			cancel()
			orbitDB.Close()
			return nil, fmt.Errorf("unable to open document store: %w", err)
		}

		// Persist the real address so subsequent runs find the same database
		dbAddress := docStore.Address().String()
		if err := os.MkdirAll(dir, 0755); err != nil {
			cancel()
			orbitDB.Close()
			docStore.Close()
			return nil, fmt.Errorf("unable to create data directory: %w", err)
		}
		if err := os.WriteFile(addrFile, []byte(dbAddress), 0644); err != nil {
			cancel()
			orbitDB.Close()
			docStore.Close()
			return nil, fmt.Errorf("unable to persist database address: %w", err)
		}
	}

	return &Client{
		ctx:     ctx,
		cancel:  cancel,
		api:     api,
		orbitDB: orbitDB,
		db:      docStore,
		dbName:  dbName,
		dbAddr:  docStore.Address().String(),
	}, nil
}

// Put stores a document in the database.
// The document must be a map[string]interface{} with a "_id" string field.
func (c *Client) Put(ctx context.Context, doc map[string]interface{}) error {
	_, err := c.db.Put(ctx, doc)
	if err != nil {
		return fmt.Errorf("unable to put document: %w", err)
	}
	return nil
}

// Get retrieves a document by its _id field.
// Returns the document or nil if not found.
func (c *Client) Get(ctx context.Context, id string) (map[string]interface{}, error) {
	docs, err := c.db.Get(ctx, id, nil)
	if err != nil {
		return nil, fmt.Errorf("unable to get document: %w", err)
	}
	if len(docs) == 0 {
		return nil, nil
	}

	doc, ok := docs[0].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("document is not a map")
	}

	return doc, nil
}

// All returns all documents in the database.
func (c *Client) All(ctx context.Context) ([]map[string]interface{}, error) {
	allDocs, err := c.db.Query(ctx, func(doc interface{}) (bool, error) {
		return true, nil
	})
	if err != nil {
		return nil, fmt.Errorf("unable to query all documents: %w", err)
	}

	result := make([]map[string]interface{}, 0, len(allDocs))
	for _, d := range allDocs {
		doc, ok := d.(map[string]interface{})
		if !ok {
			continue
		}
		result = append(result, doc)
	}

	return result, nil
}

// Delete removes a document by its _id.
func (c *Client) Delete(ctx context.Context, id string) error {
	_, err := c.db.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("unable to delete document: %w", err)
	}
	return nil
}

// Query finds documents using a filter function.
func (c *Client) Query(ctx context.Context, filter func(doc map[string]interface{}) (bool, error)) ([]map[string]interface{}, error) {
	allDocs, err := c.db.Query(ctx, func(doc interface{}) (bool, error) {
		m, ok := doc.(map[string]interface{})
		if !ok {
			return false, nil
		}
		return filter(m)
	})
	if err != nil {
		return nil, fmt.Errorf("unable to query documents: %w", err)
	}

	result := make([]map[string]interface{}, 0, len(allDocs))
	for _, d := range allDocs {
		doc, ok := d.(map[string]interface{})
		if !ok {
			continue
		}
		result = append(result, doc)
	}

	return result, nil
}

// Close closes the database and releases resources.
func (c *Client) Close() error {
	var errs []error

	if err := c.db.Close(); err != nil {
		errs = append(errs, fmt.Errorf("close db: %w", err))
	}
	if err := c.orbitDB.Close(); err != nil {
		errs = append(errs, fmt.Errorf("close orbitdb: %w", err))
	}

	c.cancel()

	if len(errs) > 0 {
		return fmt.Errorf("close errors: %v", errs)
	}
	return nil
}

// DBName returns the name of the database.
func (c *Client) DBName() string {
	return c.dbName
}

// DBAddr returns the persisted OrbitDB address of the database.
func (c *Client) DBAddr() string {
	return c.dbAddr
}

// DB returns the underlying DocumentStore for advanced operations.
func (c *Client) DB() iface.DocumentStore {
	return c.db
}

// IPFS returns the underlying IPFS CoreAPI.
func (c *Client) IPFS() coreiface.CoreAPI {
	return c.api
}

// OrbitDB returns the underlying OrbitDB instance.
func (c *Client) OrbitDB() iface.OrbitDB {
	return c.orbitDB
}
