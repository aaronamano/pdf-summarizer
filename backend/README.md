1. cd `backend`
2. run `venv\Scripts\Activate`
3. run `fastapi dev main.py` or `uvicorn main:app --reload`
4. Configure the Request Body:
<ul>
    <li>Click on the "Body" tab</li>
    <li>Select "form-data"</li>
    <li>Add a new key named file</li>
    <li>Important: Click the dropdown next to the key and select "File"</li>
    <li>Click "Select Files" and choose a PDF file to test</li>
</ul>

5. to leave venv run `deactivate`