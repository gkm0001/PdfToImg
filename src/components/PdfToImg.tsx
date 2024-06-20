 import React, { useState } from 'react'
 import * as pdfjs from 'pdfjs-dist';
 import 'pdfjs-dist/build/pdf.worker.min'; // Import PDF.js worker
import JSZip from 'jszip';
 import './PdfToImg.css'

 
 function PdfToImg() {
   
    const [images, setImages] = useState<string[]>([]);
 


    const uploadPdf = (event: React.ChangeEvent<HTMLInputElement>) => {
         
        const file = event.target.files?.[0];

        if(!file) return ;
        
        const reader = new FileReader();

        reader.onload = async() => {

             const arrayBuffers = reader.result as ArrayBuffer;
                                                              
            console.log('Array_Buffers',arrayBuffers);
            

            const typedArray = new Uint8Array(arrayBuffers);
           
            console.log("TypedArray",typedArray);
             
            try {
                const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
                console.log("PDF",pdf);
                
                const numPages = pdf.numPages;
                const imagesArray: string[] = [];

                for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    console.log(page);
                    
                    const viewport = page.getViewport({ scale: 1 });
                    console.log(viewport);
                    
          
                    const canvas = document.createElement('canvas');
                    console.log(canvas);
                    

                    const context = canvas.getContext('2d');
                    console.log(context);
                    
          
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
          
                    const renderContext : any= {
                      canvasContext: context,
                      viewport: viewport,
                    };
                    await page.render(renderContext).promise;
                    console.log("rnederContext" , renderContext);
                    
                     
                    
                    // Convert canvas to image data URL and store in array
                    const imageData = canvas.toDataURL('image/png');
                    console.log("ImageData", imageData);
                    

                    imagesArray.push(imageData);
                }
                setImages(imagesArray);
                console.log(pdf);
              } catch (error) {
                console.error('Error loading PDF:', error);
              }  



        }

        reader.readAsArrayBuffer(file)
        
    }

    const downloadImagesAsZip = async () => {
        const zip = new JSZip();
    
        try {
          // Convert each image to blob and add to zip
          await Promise.all(
            images.map(async (imageData, index) => {
              const response = await fetch(imageData);
              const blob = await response.blob();
              zip.file(`image-${index + 1}.png`, blob);
            })
          );
    
          // Generate the zip file asynchronously
          const content = await zip.generateAsync({ type: 'blob' });
    
          // Trigger the download
          const zipFile = URL.createObjectURL(content);
          const a = document.createElement('a');
          a.href = zipFile;
          a.download = 'images.zip';
          a.click();
        } catch (error) {
          console.error('Error creating zip file:', error);
        }
      };

    

   return (
     <div className='Parent'>
          <div className='Text'>Convert Pdf to Image</div>
          <div className='parent-input'>
            <input type="file" accept='pdf/*' onChange={uploadPdf} className='pdfUpload'/>
          </div>
          <div>
        {images.map((image, index) => (
          <img key={index} src={image} alt={`Page ${index + 1}`} className='images'/>
        ))}

      </div>
      <button onClick={downloadImagesAsZip} className='Download-button' >Download Images</button>
     </div>
   )
 }
 
 export default PdfToImg
 