// Add global event handlers for drag operations
export const initDragCursorFix = () => {
  if (typeof window === 'undefined') return;

  document.addEventListener('dragstart', () => {
    document.body.classList.add('dragging');
  });

  document.addEventListener('dragend', () => {
    document.body.classList.remove('dragging');
    document.body.classList.remove('dragging-over-folder');
  });

  // When hovering over an element while dragging
  document.addEventListener('dragover', (event) => {
    event.preventDefault();
    
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    
    const targetElem = event.target as HTMLElement;
    const folderElem = targetElem.closest('.folder-item');
    
    if (folderElem) {
      document.body.classList.add('dragging-over-folder');
    } else {
      document.body.classList.remove('dragging-over-folder');
    }
  });

    // Add a custom style tag to enforce move cursor
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    body.dragging * {
      cursor: pointer !important;
    }
    body.dragging-over-folder * {
      cursor: pointer !important;
    }
  `;
  document.head.appendChild(styleTag);
  
  document.addEventListener('drop', () => {
    document.body.classList.remove('dragging');
    document.body.classList.remove('dragging-over-folder');
  });
};
