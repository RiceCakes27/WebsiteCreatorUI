let selectedElement = null;

function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  const elementType = event.dataTransfer.getData('type');
  let newElement;

  // Create new elements based on type
  if (elementType === 'h1' || elementType === 'p') {
    newElement = document.createElement(elementType);
    newElement.textContent = 'Input text here';
    makeEditable(newElement);
  } else if (elementType === 'audio' || elementType === 'video' || elementType === 'img') {
    // Create a container div for the element
    newElement = document.createElement('div');
    newElement.setAttribute("id", elementType);

    // Create the element
    const mediaElement = document.createElement(elementType);
    mediaElement.controls = true;
    mediaElement.textContent = 'Click to upload a file...';

    // Add upload functionality
    newElement.addEventListener('click', () => uploadMedia(mediaElement, elementType));

    // Add the element to the container
    newElement.appendChild(mediaElement);
    if (elementType === 'img') newElement.firstChild.src = 'https://placehold.co/150';

  } else if (elementType === 'div') {
    newElement = document.createElement('div');
    //newElement.textContent = 'Div Container';
    newElement.style.padding = '10px';
    newElement.style.border = '1px solid #ccc';
  } else if (elementType === 'a') {
    newElement = document.createElement('a');
    //newElement.href = '#';
    newElement.textContent = 'Click Me';
    makeEditable(newElement);
  }

  // Ensure the element is draggable and selectable
  newElement.classList.add('draggable');
  addDeleteButton(newElement);
  newElement.addEventListener('click', () => selectElement(newElement));
  /* place elements where they are dropped very cool but also then nothing lines up
  // Set the new element's position based on the drop location
  const dropTarget = event.target;
  const dropRect = dropTarget.getBoundingClientRect();
  const offsetX = event.clientX - dropRect.left;
  const offsetY = event.clientY - dropRect.top;

  newElement.style.position = 'absolute';
  newElement.style.left = `${offsetX}px`;
  newElement.style.top = `${offsetY}px`;

  // Append the element to the drop target
  dropTarget.appendChild(newElement);
  */
  event.target.appendChild(newElement);
}

// Make text elements editable
function makeEditable(element) {
  element.setAttribute('contenteditable', 'true');
  element.addEventListener('focus', () => {
    element.style.border = '1px solid blue';
  });
  element.addEventListener('blur', () => {
    element.style.border = '1px dashed #888';
  });
}

// Add delete button to elements
function addDeleteButton(element) {
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'X';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    element.remove();
    resetOptionsPanel();
  });
  element.appendChild(deleteBtn);
}

function uploadMedia(mediaElement, type) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = type === 'video' ? 'video/*' : type === 'audio' ? 'audio/*' : 'image/*';
  input.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        mediaElement.src = reader.result; // Set uploaded media as src
      };
      reader.readAsDataURL(file);
      mediaElement.controls = true;
    }
  });
  input.click();
}

function addMediaOptions(element, mediaType) {
    const optionsContent = document.getElementById('optionsContent');
  
    // Common options for both audio and video
    let html = `
      <label>Autoplay: <input type="checkbox" id="autoplay" ${element.firstChild.autoplay ? 'checked' : ''} /></label>
      <label>Loop: <input type="checkbox" id="loop" ${element.firstChild.loop ? 'checked' : ''} /></label>
      <label>Muted: <input type="checkbox" id="muted" ${element.firstChild.muted ? 'checked' : ''} /></label>
      <label>Controls: <input type="checkbox" id="controls" ${element.firstChild.controls ? 'checked' : ''} /></label>
    `;
  
    // Add width and height options only for video
    if (mediaType === 'video') {
      html += `
        <label>Width: <input type="number" id="widthInput" value="${element.firstChild.width || ''}" /></label>
        <label>Height: <input type="number" id="heightInput" value="${element.firstChild.height || ''}" /></label>
      `;
    }
  
    optionsContent.innerHTML = html;
  
    // Event listeners for common options
    document.getElementById('autoplay').addEventListener('input', () => {
      element.firstChild.autoplay = !element.firstChild.autoplay;
    });
    document.getElementById('loop').addEventListener('input', () => {
      element.firstChild.loop = !element.firstChild.loop;
    });
    document.getElementById('muted').addEventListener('input', () => {
      element.firstChild.muted = !element.firstChild.muted;
    });
    document.getElementById('controls').addEventListener('input', () => {
      element.firstChild.controls = !element.firstChild.controls;
    });
  
    // Event listeners for width and height, only if mediaType is video
    if (mediaType === 'video') {
      document.getElementById('widthInput').addEventListener('input', (e) => {
        element.firstChild.width = e.target.value;
      });
      document.getElementById('heightInput').addEventListener('input', (e) => {
        element.firstChild.height = e.target.value;
      });
    }
}

// Select element and update options panel
function selectElement(element) {
  selectedElement = element;
  const optionsPanel = document.getElementById('optionsPanel');
  const optionsContent = document.getElementById('optionsContent');
  optionsPanel.style.display = 'block';
  optionsContent.innerHTML = ''; // Clear previous options

  if (element.tagName === 'H1' || element.tagName === 'P') {
    optionsContent.innerHTML = `
      <label>Font: <input type="text" id="fontInput" value="${element.style.fontFamily || ''}" /></label>
      <label>Font Size: <input type="number" id="fontSizeInput" value="${parseInt(element.style.fontSize) || 16}" /></label>
    `;
    document.getElementById('fontInput').addEventListener('input', (e) => {
      element.style.fontFamily = e.target.value;
    });
    document.getElementById('fontSizeInput').addEventListener('input', (e) => {
      element.style.fontSize = e.target.value + 'px';
    });
  } else if (element.id === 'img') {
    optionsContent.innerHTML = `
      <label>Width: <input type="number" id="widthInput" value="${element.firstChild.width}" /></label>
      <label>Height: <input type="number" id="heightInput" value="${element.firstChild.height}" /></label>
    `;
    document.getElementById('widthInput').addEventListener('input', (e) => {
      element.firstChild.width = e.target.value;
    });
    document.getElementById('heightInput').addEventListener('input', (e) => {
      element.firstChild.height = e.target.value;
    });
  } else if (element.id === 'video' || element.id === 'audio'){
      addMediaOptions(element, element.id);
  } else if (element.tagName === 'A') {
    optionsContent.innerHTML = `
      <label>Url: <input type="url" id="UrlInput" value="${element.href}"/></label>
      <label>Font: <input type="text" id="fontInput" value="${element.style.fontFamily || ''}" /></label>
      <label>Font Size: <input type="number" id="fontSizeInput" value="${parseInt(element.style.fontSize) || 16}" /></label>
    `;
    document.getElementById('UrlInput').addEventListener('input', (e) => {
      element.href = e.target.value;
    });
    document.getElementById('fontInput').addEventListener('input', (e) => {
      element.style.fontFamily = e.target.value;
    });
    document.getElementById('fontSizeInput').addEventListener('input', (e) => {
      element.style.fontSize = e.target.value + 'px';
    });
  } else {
    // Show color selector for canvas background
    //optionsPanel.style.display = 'none';
    optionsContent.innerHTML = `
    <label>Background: <input type="color" id="bgcolor" /></label>
    `;

    // Get the computed background color
    const canvas = document.getElementById("canvas");
    const computedBgColor = getComputedStyle(canvas).backgroundColor;

    // Convert the RGB color to a hex value for the color input
    const rgbToHex = (rgb) => {
    const rgbValues = rgb.match(/\d+/g).map(Number);
    return `#${rgbValues.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
    };

    // Set the color input's value
    document.getElementById('bgcolor').value = rgbToHex(computedBgColor);

    // Add event listener to update the background color
    document.getElementById('bgcolor').addEventListener('input', (e) => {
    canvas.style.backgroundColor = e.target.value;
    });
  }
}

// Reset options panel
function resetOptionsPanel() {
  selectedElement = null;
  document.getElementById('optionsPanel').style.display = 'none';
}

// Drag event listener for toolbox elements
document.querySelectorAll('#toolbox div').forEach(item => {
  item.addEventListener('dragstart', event => {
    event.dataTransfer.setData('type', event.target.getAttribute('data-type'));
  });
});

// Publish canvas content
document.getElementById('publishButton').addEventListener('click', () => {
    const canvas = document.getElementById('body2');
    const clonedCanvas = canvas.cloneNode(true);

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/userstyles.css';
    clonedCanvas.appendChild(stylesheet);

    // Remove canvas header
    clonedCanvas.querySelectorAll('h3').forEach((header) => header.remove());

    // Remove delete buttons
    clonedCanvas.querySelectorAll('.delete-btn').forEach((btn) => btn.remove());

    // Remove outlines and content-editable attributes
    clonedCanvas.querySelectorAll('.draggable').forEach((element) => {
        element.classList.remove('draggable');
        element.removeAttribute('contenteditable');
        element.style.border = '';
    /*
    // Remove img & audio & video divs
    const idsToRemove = ['img', 'audio', 'video'];

    idsToRemove.forEach((id) => {
        // Select all div elements with the specified ID
        const divsToRemove = clonedCanvas.querySelectorAll(`div#${id}`);
        
        divsToRemove.forEach((div) => {
        const parent = div.parentNode;
    
        // Move all children of the div to its parent
        while (div.firstChild) {
            parent.insertBefore(div.firstChild, div);
        }
    
        // Remove the empty div
        parent.removeChild(div);
        });
    });
    */
});

// Send sanitized HTML to the server
const sanitizedHtml = clonedCanvas.innerHTML;
const pathName = document.getElementById('pathName').value;

fetch('publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pathname: pathName, html: sanitizedHtml }),
})
    .then((response) => response.text())
    .then((data) => {
    document.getElementById('status').innerText = data;
    })
    .catch((error) => {
    document.getElementById('status').innerText = 'Error: ' + error.message;
    });
});