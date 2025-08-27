from flask import Flask, jsonify
from kafka import KafkaConsumer
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
import threading
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Email configuration
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USERNAME = os.getenv('SMTP_USERNAME')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
FROM_EMAIL = os.getenv('FROM_EMAIL', SMTP_USERNAME)

# Kafka configuration
KAFKA_BROKERS = os.getenv('KAFKA_BROKERS', 'localhost:9092')
USER_TOPIC = 'user-registered'
ORDER_TOPIC = 'order-created'

def send_welcome_email(user_data):
    """Send welcome email to newly registered user"""
    try:
        email = user_data.get('email')
        username = user_data.get('username')
        
        if not email or not username:
            logger.error(f"Missing email or username in user data: {user_data}")
            return False
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = FROM_EMAIL
        msg['To'] = email
        msg['Subject'] = "Welcome to MicroShop! 🎉"
        
        # Email body
        body = f"""
        <html>
        <body>
            <h2>Welcome to MicroShop, {username}! 🎉</h2>
            <p>Thank you for joining our community! We're excited to have you on board.</p>
            <p>Your account has been successfully created and you can now:</p>
            <ul>
                <li>Browse our product catalog</li>
                <li>Place orders</li>
                <li>Track your order history</li>
                <li>Manage your profile</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <br>
            <p>Best regards,<br>The MicroShop Team</p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Send email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(FROM_EMAIL, email, text)
        server.quit()
        
        logger.info(f"Welcome email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send welcome email to {email}: {str(e)}")
        return False

def send_order_confirmation_email(order_data):
    """Send order confirmation email to user"""
    try:
        email = order_data.get('userEmail')
        username = order_data.get('username')
        order_id = order_data.get('orderId')
        product_id = order_data.get('productId')
        quantity = order_data.get('quantity')
        total = order_data.get('total')
        
        logger.info(f"Processing order data: email={email}, username={username}, order_id={order_id}")
        if not email or not username or not order_id:
            logger.error(f"Missing required order data: {order_data}")
            logger.error(f"Field values: email={email}, username={username}, order_id={order_id}")
            return False
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = FROM_EMAIL
        msg['To'] = email
        msg['Subject'] = f"Order Confirmation - #{order_id}"
        
        # Email body
        body = f"""
        <html>
        <body>
            <h2>Order Confirmation - #{order_id}</h2>
            <p>Dear {username},</p>
            <p>Thank you for your order! We're excited to process it for you.</p>
            
            <h3>Order Details:</h3>
            <ul>
                <li><strong>Order ID:</strong> {order_id}</li>
                <li><strong>Product ID:</strong> {product_id}</li>
                <li><strong>Quantity:</strong> {quantity}</li>
                <li><strong>Total Amount:</strong> ${total}</li>
                <li><strong>Order Date:</strong> {order_data.get('timestamp', 'N/A')}</li>
            </ul>
            
            <p>Your order is now being processed. You'll receive updates on the status of your order.</p>
            
            <p>If you have any questions about your order, please contact our support team.</p>
            
            <br>
            <p>Best regards,<br>The MicroShop Team</p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Send email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(FROM_EMAIL, email, text)
        server.quit()
        
        logger.info(f"Order confirmation email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send order confirmation email to {email}: {str(e)}")
        return False

def consume_kafka_events():
    """Consume events from Kafka topics"""
    try:
        # Create consumer for both topics
        consumer = KafkaConsumer(
            USER_TOPIC, ORDER_TOPIC,
            bootstrap_servers=KAFKA_BROKERS,
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id='notification-service',
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )
        
        logger.info(f"Kafka consumer started. Listening to topics: {USER_TOPIC}, {ORDER_TOPIC}")
        
        for message in consumer:
            try:
                event_data = message.value
                topic = message.topic
                
                if topic == USER_TOPIC:
                    logger.info(f"Received user-registered event: {event_data}")
                    
                    # Send welcome email
                    if send_welcome_email(event_data):
                        logger.info(f"Successfully processed user-registered event for {event_data.get('email')}")
                    else:
                        logger.error(f"Failed to process user-registered event for {event_data.get('email')}")
                
                elif topic == ORDER_TOPIC:
                    logger.info(f"Received order-created event: {event_data}")
                    
                    # Send order confirmation email
                    if send_order_confirmation_email(event_data):
                        logger.info(f"Successfully processed order-created event for {event_data.get('userEmail')}")
                    else:
                        logger.error(f"Failed to process order-created event for {event_data.get('userEmail')}")
                    
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                
    except Exception as e:
        logger.error(f"Kafka consumer error: {str(e)}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'notification-service',
        'kafka_topics': [USER_TOPIC, ORDER_TOPIC],
        'kafka_brokers': KAFKA_BROKERS
    })

@app.route('/test-email', methods=['POST'])
def test_email():
    """Test endpoint to verify email functionality"""
    try:
        test_user = {
            'email': os.getenv('TEST_EMAIL', 'it@liya.ae'),
            'username': 'TestUser'
        }
        
        if send_welcome_email(test_user):
            return jsonify({'status': 'success', 'message': 'Test email sent successfully'})
        else:
            return jsonify({'status': 'error', 'message': 'Failed to send test email'}), 500
            
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    # Start Kafka consumer in a separate thread
    kafka_thread = threading.Thread(target=consume_kafka_events, daemon=True)
    kafka_thread.start()
    
    # Start Flask app
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
