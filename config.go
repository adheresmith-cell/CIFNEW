package main

import (
	"encoding/json"
	"fmt"
	"os"
)

// Config holds the server configuration loaded from orbit-config.json.
type Config struct {
	KuboAPIAddr string `json:"kuboApiAddr"`
	Port        int    `json:"port"`
	DBName      string `json:"dbName"`
	DBDir       string `json:"dbDir"`
}

// DefaultConfig returns a Config with sensible defaults.
func DefaultConfig() Config {
	return Config{
		KuboAPIAddr: "/ip4/127.0.0.1/tcp/5001",
		Port:        3456,
		DBDir:       "./orbitdb-data",
	}
}

// LoadConfig reads and parses the config file at the given path.
func LoadConfig(path string) (Config, error) {
	cfg := DefaultConfig()

	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return cfg, nil
		}
		return cfg, fmt.Errorf("read config: %w", err)
	}

	if err := json.Unmarshal(data, &cfg); err != nil {
		return cfg, fmt.Errorf("parse config: %w", err)
	}

	return cfg, nil
}