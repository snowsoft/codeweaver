// pkg/cache/cache.go
package cache

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"os"
	"path/filepath"
	"time"
)

type Cache struct {
	dir string
}

type CacheEntry struct {
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	Model     string    `json:"model"`
}

func New(dir string) *Cache {
	os.MkdirAll(dir, 0755)
	return &Cache{dir: dir}
}

func (c *Cache) Get(prompt string, model string) (string, bool) {
	key := c.key(prompt, model)
	path := filepath.Join(c.dir, key+".json")
	
	data, err := os.ReadFile(path)
	if err != nil {
		return "", false
	}
	
	var entry CacheEntry
	if err := json.Unmarshal(data, &entry); err != nil {
		return "", false
	}
	
	// Cache expires after 24 hours
	if time.Since(entry.CreatedAt) > 24*time.Hour {
		os.Remove(path)
		return "", false
	}
	
	return entry.Content, true
}

func (c *Cache) Set(prompt, model, content string) {
	key := c.key(prompt, model)
	path := filepath.Join(c.dir, key+".json")
	
	entry := CacheEntry{
		Content:   content,
		CreatedAt: time.Now(),
		Model:     model,
	}
	
	data, _ := json.Marshal(entry)
	os.WriteFile(path, data, 0644)
}

func (c *Cache) key(prompt, model string) string {
	h := sha256.New()
	h.Write([]byte(prompt + model))
	return hex.EncodeToString(h.Sum(nil))[:16]
}