import jwt
import os
import datetime
from flask import Flask, request

from flask_mysqldb import MySQL
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

server = Flask(__name__)

# Set MySQL configuration using Flask's config
server.config["MYSQL_HOST"] = os.environ.get("MYSQL_HOST")
server.config["MYSQL_USER"] = os.environ.get("MYSQL_USER")
server.config["MYSQL_PASSWORD"] = os.environ.get("MYSQL_PASSWORD")
server.config["MYSQL_PORT"] = os.environ.get("MYSQL_PORT")
server.config["MYSQL_DB"] = os.environ.get("MYSQL_DB")

# Initialize MySQL
mysql = MySQL(server)

@server.route("/login", methods=["POST"])
def login():
    auth = request.authorization

    if not auth or not auth.username or not auth.password:
        return "Missing or invalid credentials", 401

    try:
        with mysql.connection.cursor() as cur:
            res = cur.execute("SELECT email, password FROM users WHERE email=%s", (auth.username,))
            if res > 0:
                user_row = cur.fetchone()
                email, password = user_row[0], user_row[1]
                if auth.username == email and auth.password == password:
                    return create_jwt(auth.username, os.environ.get("JWT_SECRET"), True)
                else:
                    return "Invalid credentials", 403
            else:
                return "Invalid credentials", 401
    except Exception as e:
        return f"Error: {str(e)}", 500

@server.route("/validate", methods=["POST"])
def validate():
    encoded_jwt = request.headers.get("authorization")

    if not encoded_jwt:
        return "Missing Credentials", 401

    encoded_jwt = encoded_jwt.split(" ")[1]

    try:
        decoded = jwt.decode(encoded_jwt, os.environ.get("JWT_SECRET"), algorithm=["HS256"])
        return decoded, 200
    except jwt.ExpiredSignatureError:
        return "Token has expired", 401
    except jwt.InvalidTokenError:
        return "Invalid token", 403

def create_jwt(username, secret, authz):
    return jwt.encode(
        {
            "username": username,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1),
            "iat": datetime.datetime.utcnow(),
            "admin": authz
        },
        secret,
        algorithm="HS256"
    )

if __name__ == "__main__":
    server.run(host="0.0.0.0", port=5000)
