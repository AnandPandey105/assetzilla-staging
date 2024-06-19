// function showPDF(canvasId, url, parentId) {
//     console.log("Show PDF called with these parameters", canvasId, url, parentId)
//     var pdfDoc = null,
//             pageNum = 1,
//             pageRendering = false,
//             pageNumPending = null,
//             scale = 0.8,
//             canvas = document.getElementById(canvasId),
//             ctx = canvas.getContext('2d');

//         /**
//         * Get page info from document, resize canvas accordingly, and render page.
//         * @param num Page number.
//         */
//         function renderPage(num) {
//             pageRendering = true;
//             // Using promise to fetch the page
//             pdfDoc.getPage(num).then(function (page) {
//                 var viewport = page.getViewport({ scale: scale });
//                 canvas.height = viewport.height;
//                 canvas.width = viewport.width;

//                 // Render PDF page into canvas context
//                 var renderContext = {
//                     canvasContext: ctx,
//                     viewport: viewport
//                 };
//                 var renderTask = page.render(renderContext);

//                 // Wait for rendering to finish
//                 renderTask.promise.then(function () {
//                     pageRendering = false;
//                     if (pageNumPending !== null) {
//                         // New page rendering is pending
//                         renderPage(pageNumPending);
//                         pageNumPending = null;
//                     }
//                 });
//             });

//             // Update page counters
//             document.getElementById(parentId + '-page_num').textContent = num;
//         }

//         /**
//          * If another page rendering in progress, waits until the rendering is
//          * finised. Otherwise, executes rendering immediately.
//          */
//         function queueRenderPage(num) {
//             if (pageRendering) {
//                 pageNumPending = num;
//             } else {
//                 renderPage(num);
//             }
//         }

//         /**
//          * Displays previous page.
//          */
//         function onPrevPage() {
//             if (pageNum <= 1) {
//                 return;
//             }
//             pageNum--;
//             queueRenderPage(pageNum);
//         }

//         document.getElementById(parentId + '-prev').addEventListener('click', onPrevPage);

//         /**
//          * Displays next page.
//          */
//         function onNextPage() {
//             if (pageNum >= pdfDoc.numPages) {
//                 return;
//             }
//             pageNum++;
//             queueRenderPage(pageNum);
//         }
//         document.getElementById(parentId + '-next').addEventListener('click', onNextPage);

//         /**
//          * Asynchronously downloads PDF.
//          */
//         pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
//             pdfDoc = pdfDoc_;
//             document.getElementById(parentId + '-page_count').textContent = pdfDoc.numPages;

//             // Initial/first page rendering
//             renderPage(pageNum);
//         });
// }

// function showPDF(canvasId, url) {
//     let options = { scale: 1 };
//     let canvasContainer = document.getElementById(canvasId)

//     function renderPage(page) {
//         var viewport = page.getViewport(options.scale);
//         var wrapper = document.createElement("div");
//         wrapper.className = "canvas-wrapper";
//         var canvas = document.createElement('canvas');
//         var ctx = canvas.getContext('2d');
//         var renderContext = {
//           canvasContext: ctx,
//           viewport: viewport
//         };
        
//         canvas.height = viewport.height;
//         canvas.width = viewport.width;
//         wrapper.appendChild(canvas)
//         canvasContainer.appendChild(wrapper);
        
//         page.render(renderContext);
//     }
    
//     function renderPages(pdfDoc) {
//         canvasContainer.innerHTML = ""
//         for(var num = 1; num <= pdfDoc.numPages; num++)
//             pdfDoc.getPage(num).then(renderPage);
//     }
//     var PDFJS = window['pdfjs-dist/build/pdf'];

//     PDFJS.disableWorker = true;
//     PDFJS.getDocument(url).then(renderPages);

// }   
