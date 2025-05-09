from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract
import io
import logging

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
            for page in pdf_reader.pages:
                if "/XObject" in page.get("/Resources", {}):
                    x_objects = page["/Resources"]["/XObject"].get_object()
                    for obj in x_objects:
                        try:
                            if x_objects[obj]["/Subtype"] == "/Image":
                                try:
                                    size = (x_objects[obj]["/Width"], x_objects[obj]["/Height"])
                                    data = x_objects[obj].get_data()
                                    mode = "RGB"
                                    if "/ColorSpace" in x_objects[obj]:
                                        if x_objects[obj]["/ColorSpace"] == "/DeviceGray":
                                            mode = "L"
                                    image = Image.frombytes(mode, size, data)
                                    images.append(image)
                                except Exception as e:
                                    logging.error(f"Error processing image: {str(e)}")
                                    continue
                        except Exception as e:
                            logging.error(f"Error processing XObject: {str(e)}")
                            continue
        except Exception as e:
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
            "text": extracted_text.strip(),
            "handwriting": ocr_text.strip()
        }

    except Exception as e:
        logging.error(f"Main error: {str(e)}")
        return {"error": f"Error processing PDF: {str(e)}"}