from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract
import io
import logging
import re

app = FastAPI()

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def main():
    return {"message": "Hello World"}

def clean_text(text: str) -> str:
    """
    Clean and format extracted text
    """
    if not text:
        return ""
    
    # Replace multiple newlines with a single newline
    text = re.sub(r'\n\s*\n', '\n', text)
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Fix spacing after periods and commas
    text = re.sub(r'\.(?! )', '. ', text)
    text = re.sub(r',(?! )', ', ', text)
    
    # Remove any leading/trailing whitespace from lines
    lines = [line.strip() for line in text.split('\n')]
    
    # Remove empty lines
    lines = [line for line in lines if line]
    
    # Join lines back together
    return '\n'.join(lines).strip()

@app.post("/extract-pdf")
async def extract_pdf(file: UploadFile = File(...)):
    """
    Endpoint to extract text and handwriting from a PDF file.
    """
    try:
        # Read the uploaded PDF file
        pdf_reader = PdfReader(file.file)
        extracted_text = ""

        # Extract text from each page
        for page in pdf_reader.pages:
            try:
                page_text = page.extract_text()
                if page_text:
                    extracted_text += page_text + "\n"
            except Exception as e:
                logging.error(f"Error extracting text from page: {str(e)}")
                continue

        # If the PDF contains images (e.g., scanned handwriting), use OCR
        images = []
        ocr_text = ""

        try:
            #iterate through each page in the PDF document
            for page in pdf_reader.pages:
                # Check if the page has any XObject resources (could contain images)
                if "/XObject" in page.get("/Resources", {}):
                    # Get all XObjects from the page resources
                    x_objects = page["/Resources"]["/XObject"].get_object()
                    # Iterate through each XObject
                    for obj in x_objects:
                        try:
                            # Check if the XObject is an image
                            if x_objects[obj]["/Subtype"] == "/Image":
                                try:
                                    #extract image dimensions
                                    size = (x_objects[obj]["/Width"], x_objects[obj]["/Height"])
                                    #get raw image data
                                    data = x_objects[obj].get_data()
                                    #default color mode is RGB
                                    mode = "RGB"
                                    #check if image has specific color space
                                    if "/ColorSpace" in x_objects[obj]:
                                        #use "L" mode for grayscale images
                                        if x_objects[obj]["/ColorSpace"] == "/DeviceGray":
                                            mode = "L"
                                    # Create PIL Image object from raw data
                                    image = Image.frombytes(mode, size, data)
                                    # Add image to collection for later OCR processing
                                    images.append(image)
                                except Exception as e:
                                    # Log any errors in image processing but continue with next image
                                    logging.error(f"Error processing image: {str(e)}")
                                    continue
                        except Exception as e:
                            # Log any errors in XObject processing but continue with next object
                            logging.error(f"Error processing XObject: {str(e)}")
                            continue
        except Exception as e:
            # Log any general errors in the image extraction process
            logging.error(f"Error processing images: {str(e)}")

        # Perform OCR on extracted images
        for image in images:
            try:
                ocr_text += pytesseract.image_to_string(image) + "\n"
            except Exception as e:
                logging.error(f"Error performing OCR: {str(e)}")
                continue

        if not extracted_text and not ocr_text:
            return {"error": "Could not extract any text from the PDF"}

        return {
            "text": clean_text(extracted_text),
            "handwriting": clean_text(ocr_text)
        }

    except Exception as e:
        logging.error(f"Main error: {str(e)}")
        return {"error": f"Error processing PDF: {str(e)}"}
    
@app.post("/aws-textract-pdf")
async def aws_textract_pdf(file: UploadFile = File(...)):
    pass
