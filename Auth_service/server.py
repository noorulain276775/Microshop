import jwt, os, datetime
from flask import Flask, request
from flask_mysqldb import MySQL
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

server = Flask(__name__)
mysql = MySQL(server)

server.config["MYSQL_HOST"] = os.environ.get("MYSQL_HOST")
server.config["MYSQL_USER"] = os.environ.get("MYSQL_USER")
server.config["MYSQL_PASSWORD"] = os.environ.get("MYSQL_PASSWORD")
server.config["MYSQL_PORT"] = os.environ.get("MYSQL_PORT")
server.config["MYSQL_DB"] = os.environ.get("MYSQL_DB")

@server.route("/login", methods=["POST"])
def login(request):
    auth = request.authorization
    if not auth:
        return "missing credentails", 401
    auth.username
    auth.password