package main

import (
	"context"
	"fmt"

	"berty.tech/go-orbit-db/accesscontroller"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/iface"

	"github.com/ipfs/kubo/client/rpc"
	coreiface "github.com/ipfs/kubo/core/coreiface"
	ma "github.com/multiformats/go-multiaddr"
)

// Client provides a high-level API for OrbitDB document store operations.
type Client struct {
	ctx     context.Context
	cancel  context.CancelFunc
	api     coreiface.CoreAPI
	orbitDB iface.OrbitDB
	db      iface.DocumentStore
	dbName  string
	dir     string
}

// NewClient creates a new Client by connecting to a Kubo IPFS daemon
// via its API multiaddress and opening/creating an OrbitDB document store.
func NewClient(ctx context.Context, kuboMultiAddr string, dbName string, dir string) (*Client, error) {
	ctx, cancel := context.WithCancel(ctx)

	// 1. Parse multiaddress and connect to Kubo daemon
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

	// 3. Configure access control: allow all users to write
	access := accesscontroller.NewSimpleManifestParams("ipfs", map[string][]string{
		"write": {"*"},
	})

	// 4. Open or create the document store
	docStore, err := orbitDB.Docs(ctx, dbName, &iface.CreateDBOptions{
		AccessController: access,
		Directory:        &dir,
	})
	if err != nil {
		cancel()
		orbitDB.Close()
		return nil, fmt.Errorf("unable to open document store: %w", err)
	}

	return &Client{
		ctx:     ctx,
		cancel:  cancel,
		api:     api,
		orbitDB: orbitDB,
		db:      docStore,
		dbName:  dbName,
		dir:     dir,
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

// IPFS returns the underlying IPFS CoreAPI.
func (c *Client) IPFS() coreiface.CoreAPI {
	return c.api
}

// OrbitDB returns the underlying OrbitDB instance.
func (c *Client) OrbitDB() iface.OrbitDB {
	return c.orbitDB
}

// DBName returns the name of the database.
func (c *Client) DBName() string {
	return c.dbName
}