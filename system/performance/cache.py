#!/usr/bin/env python3
"""
Semantic Cache for Hired AI System - Phase 4
Token optimization through intelligent caching.
"""

from typing import Optional, Dict, Any, List
import hashlib
import json
import os
from datetime import datetime, timedelta

WORKSPACE = "/Users/levinolonan/.openclaw/workspace"

class SemanticCache:
    """Cache for semantically similar requests."""
    
    def __init__(self, ttl_hours: int = 24):
        self.ttl = timedelta(hours=ttl_hours)
        self.hit_count = 0
        self.miss_count = 0
        self.cache_file = f"{WORKSPACE}/system/performance/cache/semantic-cache.json"
        self.cache = self._load_cache()
    
    def _load_cache(self) -> Dict[str, Any]:
        """Load cache from disk."""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r') as f:
                    data = json.load(f)
                    # Clean expired entries
                    return self._clean_expired(data)
            except:
                pass
        return {}
    
    def _save_cache(self):
        """Save cache to disk."""
        os.makedirs(os.path.dirname(self.cache_file), exist_ok=True)
        with open(self.cache_file, 'w') as f:
            json.dump(self.cache, f, indent=2)
    
    def _clean_expired(self, data: Dict) -> Dict:
        """Remove expired cache entries."""
        now = datetime.now()
        cleaned = {}
        for key, entry in data.items():
            timestamp = datetime.fromisoformat(entry['timestamp'])
            if now - timestamp < self.ttl:
                cleaned[key] = entry
        return cleaned
    
    def _generate_key(self, request: str, context: Dict) -> str:
        """Generate cache key from request and context."""
        # Normalize request (remove whitespace variations)
        normalized = ' '.join(request.lower().split())
        
        # Include relevant context
        key_data = f"{normalized}:{json.dumps(context, sort_keys=True)}"
        return hashlib.sha256(key_data.encode()).hexdigest()[:16]
    
    def get(self, request: str, context: Dict) -> Optional[Dict]:
        """Get cached response if available and fresh."""
        key = self._generate_key(request, context)
        
        if key in self.cache:
            entry = self.cache[key]
            timestamp = datetime.fromisoformat(entry['timestamp'])
            if datetime.now() - timestamp < self.ttl:
                self.hit_count += 1
                return entry['response']
            else:
                # Expired
                del self.cache[key]
                self._save_cache()
        
        self.miss_count += 1
        return None
    
    def set(self, request: str, context: Dict, response: Dict):
        """Cache a response."""
        key = self._generate_key(request, context)
        
        self.cache[key] = {
            'response': response,
            'timestamp': datetime.now().isoformat(),
            'request_hash': key,
            'access_count': 1
        }
        
        self._save_cache()
    
    def invalidate(self, pattern: str = None):
        """Invalidate cache entries."""
        if pattern:
            keys_to_remove = [
                k for k in self.cache.keys()
                if pattern in self.cache[k].get('request_hash', '')
            ]
            for key in keys_to_remove:
                del self.cache[key]
        else:
            self.cache = {}
        
        self._save_cache()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total = self.hit_count + self.miss_count
        hit_rate = self.hit_count / total if total > 0 else 0
        
        # Calculate estimated savings (approximate 0.5 cost per hit)
        estimated_savings = self.hit_count * 0.5
        
        return {
            'hits': self.hit_count,
            'misses': self.miss_count,
            'hit_rate': hit_rate,
            'entries': len(self.cache),
            'estimated_savings': estimated_savings,
            'cache_file': self.cache_file
        }


class ContextCompressor:
    """Compress context to reduce token usage."""
    
    def __init__(self):
        self.compression_stats = {
            'original_tokens': 0,
            'compressed_tokens': 0,
            'compression_ratio': 0
        }
    
    def compress(self, context: str, max_tokens: int = 4000) -> str:
        """Compress context to fit within token limit."""
        import re
        
        # Estimate current tokens (rough approximation: 4 chars = 1 token)
        estimated_tokens = len(context) // 4
        
        if estimated_tokens <= max_tokens:
            return context
        
        # Apply compression strategies
        compressed = context
        
        # 1. Remove redundant whitespace
        compressed = self._remove_redundant_whitespace(compressed)
        
        # 2. Summarize long sections
        compressed = self._summarize_sections(compressed)
        
        # 3. Remove low-priority content
        compressed = self._prioritize_content(compressed, max_tokens)
        
        # Update stats
        new_tokens = len(compressed) // 4
        self.compression_stats['original_tokens'] += estimated_tokens
        self.compression_stats['compressed_tokens'] += new_tokens
        
        return compressed
    
    def _remove_redundant_whitespace(self, text: str) -> str:
        """Remove extra whitespace and newlines."""
        import re
        # Replace multiple newlines with single
        text = re.sub(r'\n{3,}', '\n\n', text)
        # Replace multiple spaces with single
        text = re.sub(r' {2,}', ' ', text)
        return text.strip()
    
    def _summarize_sections(self, text: str) -> str:
        """Summarize long content sections."""
        lines = text.split('\n')
        summarized = []
        
        for line in lines:
            if len(line) > 200:
                # Truncate long lines with indicator
                summarized.append(line[:200] + "... [truncated]")
            else:
                summarized.append(line)
        
        return '\n'.join(summarized)
    
    def _prioritize_content(self, text: str, max_tokens: int) -> str:
        """Keep only high-priority content if still too long."""
        lines = text.split('\n')
        
        # Priority scoring (higher = more important)
        priority_keywords = {
            'error': 10, 'critical': 10, 'failed': 9,
            'warning': 8, 'important': 8,
            'task': 7, 'action': 7,
            'info': 5, 'note': 5,
        }
        
        scored_lines = []
        for line in lines:
            score = 5  # Base score
            for keyword, weight in priority_keywords.items():
                if keyword in line.lower():
                    score += weight
            scored_lines.append((score, line))
        
        # Sort by priority
        scored_lines.sort(reverse=True)
        
        # Keep top lines until token limit
        result_lines = []
        current_tokens = 0
        
        for score, line in scored_lines:
            line_tokens = len(line) // 4
            if current_tokens + line_tokens > max_tokens:
                break
            result_lines.append(line)
            current_tokens += line_tokens
        
        # Restore original order
        result_lines.sort(key=lambda x: lines.index(x) if x in lines else 9999)
        
        return '\n'.join(result_lines)
    
    def get_stats(self) -> Dict:
        """Get compression statistics."""
        orig = self.compression_stats['original_tokens']
        comp = self.compression_stats['compressed_tokens']
        
        return {
            'original_tokens': orig,
            'compressed_tokens': comp,
            'tokens_saved': orig - comp,
            'compression_ratio': (orig - comp) / orig if orig > 0 else 0
        }


if __name__ == '__main__':
    print("=" * 60)
    print("Semantic Cache & Context Compression")
    print("=" * 60)
    
    # Test cache
    print("\n🧪 Testing Semantic Cache:")
    cache = SemanticCache(ttl_hours=1)
    
    # Store a response
    request = "What is the weather in San Francisco?"
    context = {"location": "San Francisco"}
    response = {"temperature": "72°F", "condition": "Sunny"}
    
    cache.set(request, context, response)
    print(f"  Cached: {request}")
    
    # Retrieve it
    cached = cache.get(request, context)
    if cached:
        print(f"  Cache hit: {cached}")
    
    # Stats
    stats = cache.get_stats()
    print(f"\n  Cache Stats:")
    print(f"    Hits: {stats['hits']}")
    print(f"    Misses: {stats['misses']}")
    print(f"    Hit Rate: {stats['hit_rate']:.1%}")
    
    # Test compression
    print("\n🧪 Testing Context Compression:")
    compressor = ContextCompressor()
    
    long_context = """
    This is a very long context that needs to be compressed.
    
    
    
    It has multiple blank lines and redundant whitespace.
    
    Error: Something critical happened here that needs attention.
    This is just filler text that could be removed if needed.
    This is just filler text that could be removed if needed.
    This is just filler text that could be removed if needed.
    """ * 50
    
    compressed = compressor.compress(long_context, max_tokens=100)
    print(f"  Original length: {len(long_context)} chars")
    print(f"  Compressed length: {len(compressed)} chars")
    
    comp_stats = compressor.get_stats()
    print(f"  Tokens saved: {comp_stats['tokens_saved']}")
    
    print("\n✅ Cache & Compression Ready")
