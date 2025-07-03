#!/bin/bash
.\env\Scripts\activate.bat
set FLASK_APP=app
set FLASK_ENV=development
flask run --debug