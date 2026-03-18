#!/bin/bash

# Memory Consolidation Helper Script
# This script helps with the weekly memory consolidation process

set -e

WORKSPACE="/Users/levinolonan/.openclaw/workspace"
MEMORY_DIR="$WORKSPACE/memory"
KNOWLEDGE_DIR="$WORKSPACE/knowledge"
SKILLS_DIR="$WORKSPACE/skills"
ARCHIVE_DIR="$MEMORY_DIR/archive"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if directories exist
check_directories() {
    log_info "Checking directory structure..."
    
    for dir in "$MEMORY_DIR" "$KNOWLEDGE_DIR" "$SKILLS_DIR"; do
        if [ ! -d "$dir" ]; then
            log_error "Directory not found: $dir"
            exit 1
        fi
    done
    
    log_success "Directory structure is valid"
}

# Generate weekly summary
generate_weekly_summary() {
    local days=7
    local end_date=$(date +%Y-%m-%d)
    local start_date=$(date -v-${days}d +%Y-%m-%d)
    
    log_info "Generating weekly summary ($start_date to $end_date)..."
    
    # Find memory files from the past week
    local memory_files=()
    for i in $(seq 0 $((days-1))); do
        local date_str=$(date -v-${i}d +%Y-%m-%d)
        local file="$MEMORY_DIR/${date_str}.md"
        if [ -f "$file" ]; then
            memory_files+=("$file")
        fi
    done
    
    if [ ${#memory_files[@]} -eq 0 ]; then
        log_warning "No memory files found for the past week"
        return
    fi
    
    # Create summary file
    local summary_file="$MEMORY_DIR/weekly-summary-${end_date}.md"
    cat > "$summary_file" << EOF
# Weekly Summary: $start_date to $end_date

## Overview
- Period: $start_date to $end_date
- Memory files: ${#memory_files[@]}
- Generated: $(date)

## Files Reviewed
$(for file in "${memory_files[@]}"; do echo "- $(basename "$file")"; done)

## Key Topics (Word Frequency)
$(printf '%s\n' "${memory_files[@]}" | xargs cat 2>/dev/null | tr '[:upper:]' '[:lower:]' | tr -cs '[:alnum:]' '\n' | sort | uniq -c | sort -nr | head -20 | awk '{print "- " $2 ": " $1 " occurrences"}')

## Potential Knowledge to Extract
_Look for these patterns during consolidation:_

### Concepts
- Definitions, explanations, mental models
- New understanding or insights
- Frameworks or theories discussed

### People
- New contacts or relationships
- Updated information about individuals
- Important conversations or interactions

### Projects
- Progress updates or milestones
- Challenges and solutions
- Decisions made or needed
- Next steps or action items

### Systems
- Tools or technologies learned
- Processes or workflows described
- Integrations or automations discussed
- Technical details or configurations

### Skills
- New procedures or methods learned
- Problems solved and how
- Workflows documented or improved
- Techniques practiced or refined

## Consolidation Checklist
- [ ] Review each memory file for significant content
- [ ] Extract concepts to knowledge/concepts/
- [ ] Update people information in knowledge/people/
- [ ] Document project progress in knowledge/projects/
- [ ] Add system knowledge to knowledge/systems/
- [ ] Document new skills in appropriate skills/ directory
- [ ] Update MEMORY.md with significant events
- [ ] Archive files older than 30 days

## Notes
_Add any observations about the week's content here:_

EOF
    
    log_success "Weekly summary generated: $(basename "$summary_file")"
    echo "Summary file: $summary_file"
}

# Check for files needing archiving
check_archiving() {
    log_info "Checking for files older than 30 days..."
    
    local archive_count=0
    local threshold_date=$(date -v-30d +%Y-%m-%d)
    
    # Create archive directory if it doesn't exist
    mkdir -p "$ARCHIVE_DIR"
    
    # Find files older than 30 days
    for file in "$MEMORY_DIR"/*.md; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            # Extract date from filename (format: YYYY-MM-DD.md or YYYY-MM-DD-*.md)
            if [[ $filename =~ ^([0-9]{4}-[0-9]{2}-[0-9]{2}) ]]; then
                local file_date="${BASH_REMATCH[1]}"
                if [[ $file_date < $threshold_date ]]; then
                    log_info "Found file to archive: $filename"
                    archive_count=$((archive_count + 1))
                fi
            fi
        fi
    done
    
    if [ $archive_count -eq 0 ]; then
        log_success "No files need archiving"
    else
        log_warning "$archive_count files are older than 30 days and should be archived"
        echo "Run manually: mv \"$MEMORY_DIR/\"*.md \"$ARCHIVE_DIR/\" (after review)"
    fi
}

# Check knowledge directory structure
check_knowledge_structure() {
    log_info "Checking knowledge directory structure..."
    
    local subdirs=("concepts" "people" "projects" "systems" "world")
    local missing_dirs=()
    
    for subdir in "${subdirs[@]}"; do
        if [ ! -d "$KNOWLEDGE_DIR/$subdir" ]; then
            missing_dirs+=("$subdir")
        fi
    done
    
    if [ ${#missing_dirs[@]} -eq 0 ]; then
        log_success "Knowledge directory structure is complete"
    else
        log_warning "Missing knowledge subdirectories: ${missing_dirs[*]}"
        echo "Create with: mkdir -p \"$KNOWLEDGE_DIR/{${missing_dirs[*]}}\""
    fi
}

# Check skills directory structure
check_skills_structure() {
    log_info "Checking skills directory structure..."
    
    local subdirs=("technical" "creative" "analytical" "social" "operational")
    local missing_dirs=()
    
    for subdir in "${subdirs[@]}"; do
        if [ ! -d "$SKILLS_DIR/$subdir" ]; then
            missing_dirs+=("$subdir")
        fi
    done
    
    if [ ${#missing_dirs[@]} -eq 0 ]; then
        log_success "Skills directory structure is complete"
    else
        log_warning "Missing skills subdirectories: ${missing_dirs[*]}"
        echo "Create with: mkdir -p \"$SKILLS_DIR/{${missing_dirs[*]}}\""
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "========================================"
    echo "    Memory Consolidation Helper"
    echo "========================================"
    echo ""
    echo "1. Generate weekly summary"
    echo "2. Check for archiving needs"
    echo "3. Check directory structure"
    echo "4. Run all checks"
    echo "5. Exit"
    echo ""
    read -p "Select option (1-5): " choice
    
    case $choice in
        1)
            generate_weekly_summary
            ;;
        2)
            check_archiving
            ;;
        3)
            check_directories
            check_knowledge_structure
            check_skills_structure
            ;;
        4)
            check_directories
            generate_weekly_summary
            check_knowledge_structure
            check_skills_structure
            check_archiving
            ;;
        5)
            log_info "Exiting"
            exit 0
            ;;
        *)
            log_error "Invalid option"
            ;;
    esac
}

# Main execution
main() {
    log_info "Starting memory consolidation helper..."
    
    # Check if running interactively
    if [ -t 0 ]; then
        # Interactive mode
        while true; do
            show_menu
        done
    else
        # Non-interactive mode - run all checks
        check_directories
        generate_weekly_summary
        check_knowledge_structure
        check_skills_structure
        check_archiving
    fi
}

# Run main function
main "$@"