document.getElementById('imageInput').addEventListener('change', handleFiles);
document.getElementById('convertBtn').addEventListener('click', convertToPDF);

let imagesArray = [];

function handleFiles(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = ''; // Clear the container

    imagesArray = []; // Reset the images array

    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgElement = document.createElement('div');
            imgElement.className = 'previewImage';
            imgElement.draggable = true;
            imgElement.dataset.index = index;
            imgElement.innerHTML = `<img src="${e.target.result}" alt="Image ${index + 1}">`;

            imgElement.addEventListener('dragstart', dragStart);
            imgElement.addEventListener('dragover', dragOver);
            imgElement.addEventListener('drop', drop);

            previewContainer.appendChild(imgElement);
            imagesArray.push(file);
        };
        reader.readAsDataURL(file);
    });
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const draggedIndex = e.dataTransfer.getData('text/plain');
    const targetIndex = e.target.closest('.previewImage').dataset.index;

    const draggedElement = document.querySelector(`[data-index='${draggedIndex}']`);
    const targetElement = document.querySelector(`[data-index='${targetIndex}']`);

    const previewContainer = document.getElementById('previewContainer');
    previewContainer.insertBefore(draggedElement, targetElement);

    // Update the images array order
    const temp = imagesArray[draggedIndex];
    imagesArray[draggedIndex] = imagesArray[targetIndex];
    imagesArray[targetIndex] = temp;

    // Update the data-index attributes
    document.querySelectorAll('.previewImage').forEach((element, newIndex) => {
        element.dataset.index = newIndex;
    });
}

async function convertToPDF() {
    const pdfDoc = await PDFLib.PDFDocument.create();

    for (const file of imagesArray) {
        const imageBytes = await file.arrayBuffer();
        let image;

        if (file.type === 'image/jpeg') {
            image = await pdfDoc.embedJpg(imageBytes);
        } else if (file.type === 'image/png') {
            image = await pdfDoc.embedPng(imageBytes);
        } else {
            alert("Unsupported image type: " + file.type);
            return;
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height
        });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = `<a href="${url}" download="converted.pdf">Download PDF</a>`;
}
