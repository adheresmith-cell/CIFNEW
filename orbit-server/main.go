package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	// =========================
	// 1. Load configuration
	// =========================
	configPath := "orbit-config.json"
	if len(os.Args) > 1 {
		configPath = os.Args[1]
	}

	cfg, err := LoadConfig(configPath)
	if err != nil {
		log.Fatalf("❌ Failed to load config: %v", err)
	}

	fmt.Println("🚀 Starting OrbitDB backend server...")
	fmt.Printf("   Kubo API: %s\n", cfg.KuboAPIAddr)
	fmt.Printf("   DB Name:  %s\n", cfg.DBName)
	fmt.Printf("   DB Dir:   %s\n", cfg.DBDir)
	fmt.Printf("   Port:     %d\n", cfg.Port)

	// =========================
	// 2. Initialize OrbitDB
	// =========================
	client, err := NewClient(context.Background(), cfg.KuboAPIAddr, cfg.DBName, cfg.DBDir)
	if err != nil {
		log.Fatalf("❌ Failed to create OrbitDB client: %v", err)
	}
	defer client.Close()

	fmt.Println("✅ OrbitDB backend ready")

	// =========================
	// 3. Setup HTTP routes
	// =========================
	mux := http.NewServeMux()
	RegisterRoutes(mux, client)

	// =========================
	// 4. Start HTTP server
	// =========================
	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", cfg.Port),
		Handler: withCORS(mux),
	}

	// Graceful shutdown on SIGINT/SIGTERM
	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		sig := <-sigCh
		fmt.Printf("\n📥 Received signal %v, shutting down...\n", sig)

		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		server.Shutdown(shutdownCtx)
	}()

	fmt.Printf(`
╔══════════════════════════════════════════╗
║   OrbitDB Backend Server (Go)           ║
║   Port: %-33d║
║   OrbitDB: %-31s║
╚══════════════════════════════════════════╝
`, cfg.Port, cfg.DBName)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("❌ Server error: %v", err)
	}

	fmt.Println("👋 Server stopped")
}

// withCORS wraps an http.Handler with CORS headers.
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}