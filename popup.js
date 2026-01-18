// ============================================================================
// DRAGGABLE FUNCTIONALITY
// ============================================================================

let isDragging = false;
let dragOffset = { x: 0, y: 0 };
const draggableHeader = document.querySelector('.draggable-header');
const closeBtn = document.getElementById('closeBtn');

// Make popup draggable when clicking header (except close button)
draggableHeader.addEventListener('mousedown', (e) => {
  // Don't start drag if clicking the close button
  if (e.target === closeBtn || e.target.closest('#closeBtn')) {
    return;
  }
  
  isDragging = true;
  
  // Get current position and mouse offset
  const rect = document.body.getBoundingClientRect();
  dragOffset.x = e.clientX - rect.left;
  dragOffset.y = e.clientY - rect.top;
  
  // Add dragging styles
  document.body.classList.add('dragging');
  draggableHeader.classList.add('dragging');
  document.body.style.cursor = 'grabbing';
  
  // Add event listeners for dragging
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  // Prevent text selection during drag
  e.preventDefault();
});

// Handle mouse movement during drag
function handleMouseMove(e) {
  if (!isDragging) return;
  
  // Calculate new position
  const newX = e.clientX - dragOffset.x;
  const newY = e.clientY - dragOffset.y;
  
  // Apply new position with boundary checks
  const maxX = window.innerWidth - document.body.offsetWidth;
  const maxY = window.innerHeight - document.body.offsetHeight;
  
  document.body.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
  document.body.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
}

// Stop dragging
function handleMouseUp() {
  if (!isDragging) return;
  
  isDragging = false;
  
  // Remove dragging styles
  document.body.classList.remove('dragging');
  draggableHeader.classList.remove('dragging');
  document.body.style.cursor = 'default';
  
  // Remove event listeners
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
}

// ============================================================================
// NOTE FUNCTIONALITY
// ============================================================================

// DOM Elements
const noteInput = document.getElementById('noteInput');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const statusEl = document.getElementById('status');

// Load saved note when extension opens
document.addEventListener('DOMContentLoaded', () => {
  loadSavedNote();
  
  // Focus and select all text in the input
  noteInput.focus();
  noteInput.select();
});

// Load note from Chrome storage
function loadSavedNote() {
  chrome.storage.local.get(['quickNote'], (result) => {
    if (result.quickNote) {
      noteInput.value = result.quickNote;
    }
  });
}

// Auto-save with debounce (500ms delay)
let saveTimeout;
noteInput.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveNote, 500);
});

// Save button click handler
saveBtn.addEventListener('click', () => {
  saveNote();
  showStatus('Saved!', 'saved');
});

// Clear button click handler
clearBtn.addEventListener('click', () => {
  if (noteInput.value.trim() === '') {
    showStatus('Already empty!', 'cleared');
    return;
  }
  
  if (confirm('Clear your note? This cannot be undone.')) {
    noteInput.value = '';
    saveNote();
    showStatus('Cleared!', 'cleared');
  }
});

// Close button click handler
closeBtn.addEventListener('click', () => {
  window.close();
});

// Save note to Chrome storage
function saveNote() {
  const note = noteInput.value;
  chrome.storage.local.set({ quickNote: note }, () => {
    // Save confirmation is handled by caller
  });
}

// Show status message
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = `status ${type} show`;
  
  // Auto-hide status after 1.5 seconds
  setTimeout(() => {
    statusEl.classList.remove('show');
  }, 1500);
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

noteInput.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveNote();
    showStatus('Saved!', 'saved');
  }
  
  // Ctrl/Cmd + K to clear
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    clearBtn.click();
  }
  
  // Escape to close popup
  if (e.key === 'Escape' && 
      !e.shiftKey && 
      !e.ctrlKey && 
      !e.altKey && 
      !e.metaKey) {
    e.preventDefault();
    window.close();
  }
});

// ============================================================================
// WINDOW BOUNDARY PROTECTION
// ============================================================================

// Keep window within screen bounds on resize
window.addEventListener('resize', () => {
  const rect = document.body.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width;
  const maxY = window.innerHeight - rect.height;
  
  const currentX = parseInt(document.body.style.left) || 100;
  const currentY = parseInt(document.body.style.top) || 100;
  
  document.body.style.left = `${Math.max(0, Math.min(currentX, maxX))}px`;
  document.body.style.top = `${Math.max(0, Math.min(currentY, maxY))}px`;
});