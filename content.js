let isEnabled = false;
let notepadWindow = null;
let notepadContent = null;
let isDragging = false;
let dragStartX, dragStartY;

chrome.storage.sync.get('isEnabled', function(data) {
  isEnabled = data.isEnabled;
  if (isEnabled) {
    createNotepadWindow();
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleExtension") {
    isEnabled = request.isEnabled;
    if (isEnabled) {
      createNotepadWindow();
    } else {
      removeNotepadWindow();
    }
  }
});

function createNotepadWindow() {
  if (!notepadWindow) {
    notepadWindow = document.createElement('div');
    notepadWindow.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      height: 400px;
      background-color: white;
      border: 1px solid #ccc;
      z-index: 9999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    `;

    let header = document.createElement('div');
    header.style.cssText = `
      padding: 10px;
      background-color: #f1f1f1;
      cursor: move;
      user-select: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    let headerText = document.createElement('span');
    headerText.textContent = 'Notepad';
    
    let downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download';
    downloadButton.style.cssText = `
      padding: 5px 10px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;
    `;
    downloadButton.addEventListener('click', downloadNotepad);

    header.appendChild(headerText);
    header.appendChild(downloadButton);
    header.addEventListener('mousedown', startDragging);

    notepadContent = document.createElement('div');
    notepadContent.style.cssText = `
      height: calc(100% - 40px);
      padding: 10px;
      overflow-y: auto;
    `;
    notepadContent.contentEditable = true;

    notepadWindow.appendChild(header);
    notepadWindow.appendChild(notepadContent);
    document.body.appendChild(notepadWindow);

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
  }
}

function removeNotepadWindow() {
  if (notepadWindow) {
    document.body.removeChild(notepadWindow);
    notepadWindow = null;
    notepadContent = null;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDragging);
  }
}

function startDragging(e) {
  if (e.target.tagName.toLowerCase() !== 'button') {
    isDragging = true;
    dragStartX = e.clientX - notepadWindow.offsetLeft;
    dragStartY = e.clientY - notepadWindow.offsetTop;
  }
}

function drag(e) {
  if (isDragging) {
    notepadWindow.style.left = (e.clientX - dragStartX) + 'px';
    notepadWindow.style.top = (e.clientY - dragStartY) + 'px';
  }
}

function stopDragging() {
  isDragging = false;
}

document.addEventListener('mouseup', function() {
  if (isEnabled) {
    let selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      appendToNotepad(selectedText);
    }
  }
});

function appendToNotepad(text) {
  if (notepadContent) {
    let textNode = document.createElement('p');
    textNode.textContent = text;
    notepadContent.appendChild(textNode);
    notepadContent.scrollTop = notepadContent.scrollHeight;
  }
}

function downloadNotepad() {
  if (notepadContent) {
    let text = notepadContent.innerText;
    let blob = new Blob([text], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    
    let a = document.createElement('a');
    a.href = url;
    a.download = 'notepad_content.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}