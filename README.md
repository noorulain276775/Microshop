# This Project is using Python, Docker, RabbitMQ, MySQL, MongoDB and Kubernetes 

## Dockerfile
FROM python:3.10-slim-bullseye: This line specifies the base image for your Docker image. In this case, it's using an official Python 3.10 image based on the slim version of Debian Bullseye.

RUN apt-get update && apt-get install -y --no-install-recommends --no-install-suggests build-essential default-libmysqlclient-dev && pip install --no-cache-dir --upgrade pip: This RUN command updates the package list in the image and installs some essential tools and dependencies. Here's a breakdown:

apt-get update: Updates the package list.
apt-get install -y --no-install-recommends --no-install-suggests build-essential default-libmysqlclient-dev: Installs build-essential (which includes essential build tools) and the development files for the default MySQL client library. The flags are used to avoid installing recommended and suggested packages.
pip install --no-cache-dir --upgrade pip: Upgrades pip to the latest version.
WORKDIR /app: Sets the working directory inside the container to /app.

COPY ./requirements.txt /app: Copies the requirements.txt file from the host machine to the /app directory inside the container.

RUN pip install --no-cache-dir --requirements /app/requirements.txt: Installs Python dependencies specified in the requirements.txt file using pip. The --no-cache-dir flag avoids caching the downloaded packages, which can help reduce the image size.

COPY . /app: Copies the current directory (the entire application code) from the host machine to the /app directory inside the container.

EXPOSE 5000: Informs Docker that the container will listen on port 5000 at runtime. This doesn't actually publish the port; it's more of a documentation feature.

CMD ["python3", "server.py"]: Specifies the command to run when the container starts. In this case, it runs the server.py script using Python 3.