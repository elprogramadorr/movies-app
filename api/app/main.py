from fastapi import FASTAPI
import firebase_admin


app = FASTAPI()

@app.get("/")
def read_root():
    return "hola mierda"