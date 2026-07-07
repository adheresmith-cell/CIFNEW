package main

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

// orbitClient interface abstracts the Client for handler testing.
type orbitClient interface {
	Put(ctx context.Context, doc map[string]interface{}) error
	Get(ctx context.Context, id string) (map[string]interface{}, error)
	All(ctx context.Context) ([]map[string]interface{}, error)
	Close() error
}

// RegisterRoutes sets up all HTTP routes on the given mux.
func RegisterRoutes(mux *http.ServeMux, client *Client) {
	mux.HandleFunc("/api/ping", handlePing)
	mux.HandleFunc("/api/p2p/status", handleP2PStatus(client))
	mux.HandleFunc("/api/p2p/peers", handleP2PPeers(client))
	mux.HandleFunc("/api/db/put", handleDBPut(client))
	mux.HandleFunc("/api/db/get/", handleDBGet(client))
	mux.HandleFunc("/api/db/all", handleDBAll(client))
}

// ---------- Helpers ----------

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// ---------- Handlers ----------

func handlePing(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"ok":        true,
		"timestamp": nowMS(),
	})
}

func handleP2PStatus(client *Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		// Get peer ID via KeyAPI.Self()
		key, err := client.IPFS().Key().Self(ctx)
		peerID := ""
		connected := false
		peerCount := 0

		if err == nil && key != nil {
			peerID = key.ID().String()
			connected = true
		}

		// Get connected peers count
		peers, err := client.IPFS().Swarm().Peers(ctx)
		if err == nil {
			peerCount = len(peers)
		}

		writeJSON(w, http.StatusOK, map[string]interface{}{
			"connected": connected,
			"peerId":    peerID,
			"peers":     peerCount,
		})
	}
}

func handleP2PPeers(client *Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		peers, err := client.IPFS().Swarm().Peers(ctx)
		if err != nil {
			writeJSON(w, http.StatusOK, map[string]interface{}{
				"peers": []interface{}{},
			})
			return
		}

		peerList := make([]map[string]interface{}, 0, len(peers))
		for _, p := range peers {
			latencyStr := ""
			if lat, err := p.Latency(); err == nil {
				latencyStr = lat.String()
			}

			peerList = append(peerList, map[string]interface{}{
				"peer":    p.ID().String(),
				"addr":    p.Address().String(),
				"latency": latencyStr,
			})
		}

		writeJSON(w, http.StatusOK, map[string]interface{}{
			"peers": peerList,
		})
	}
}

func handleDBPut(client *Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "POST required")
			return
		}

		var doc map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&doc); err != nil {
			writeError(w, http.StatusBadRequest, "invalid JSON body")
			return
		}

		if doc == nil {
			writeError(w, http.StatusBadRequest, "invalid document")
			return
		}

		if err := client.Put(r.Context(), doc); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}

		// Extract _id as the document ID
		id := ""
		if v, ok := doc["_id"]; ok {
			id, _ = v.(string)
		}

		writeJSON(w, http.StatusOK, map[string]interface{}{
			"ok": true,
			"id": id,
		})
	}
}

func handleDBGet(client *Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extract ID from path: /api/db/get/{id}
		id := strings.TrimPrefix(r.URL.Path, "/api/db/get/")
		if id == "" {
			writeError(w, http.StatusBadRequest, "id required")
			return
		}

		doc, err := client.Get(r.Context(), id)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}

		if doc == nil {
			writeJSON(w, http.StatusOK, nil)
			return
		}

		writeJSON(w, http.StatusOK, doc)
	}
}

func handleDBAll(client *Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		docs, err := client.All(r.Context())
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}

		if docs == nil {
			docs = []map[string]interface{}{}
		}

		writeJSON(w, http.StatusOK, docs)
	}
}

// nowMS returns the current Unix timestamp in milliseconds.
func nowMS() int64 {
	return time.Now().UnixMilli()
}