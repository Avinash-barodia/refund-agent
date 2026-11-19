import sqlite3
import datetime
import random

def setup_database():
    conn = sqlite3.connect('crm.db')
    cursor = conn.cursor()

    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            item_name TEXT NOT NULL,
            amount REAL NOT NULL,
            purchase_date TEXT NOT NULL,
            is_final_sale BOOLEAN NOT NULL,
            status TEXT NOT NULL DEFAULT 'completed',
            FOREIGN KEY(customer_id) REFERENCES customers(id)
        )
    ''')

    # Clear existing data
    cursor.execute('DELETE FROM orders')
    cursor.execute('DELETE FROM customers')

    # Seed Data
    customers = [
        ("Alice Smith", "alice@example.com"),
        ("Bob Johnson", "bob@example.com"),
        ("Charlie Brown", "charlie@example.com"),
        ("Diana Ross", "diana@example.com"),
        ("Evan Wright", "evan@example.com"),
        ("Fiona Apple", "fiona@example.com"),
        ("George Michael", "george@example.com"),
        ("Hannah Montana", "hannah@example.com"),
        ("Ian Somerhalder", "ian@example.com"),
        ("Jack Dawson", "jack@example.com"),
        ("Karen Page", "karen@example.com"),
        ("Leo DiCaprio", "leo@example.com"),
        ("Mia Wallace", "mia@example.com"),
        ("Nina Dobrev", "nina@example.com"),
        ("Oscar Isaac", "oscar@example.com"),
    ]

    cursor.executemany('''
        INSERT INTO customers (name, email) VALUES (?, ?)
    ''', customers)
    
    conn.commit()

    # Get customer IDs
    cursor.execute('SELECT id, email FROM customers')
    customer_ids = cursor.fetchall()

    today = datetime.date.today()
    
    # Pre-defined order scenarios
    scenarios = [
        # format: (item_name, amount, days_ago, is_final_sale)
        ("Cheap T-Shirt", 20.00, 5, False), # Eligible for refund
        ("Expensive Laptop", 1200.00, 10, False), # Over $500, requires escalation
        ("Clearance Shoes", 45.00, 3, True), # Final sale, no refund
        ("Old Headphones", 150.00, 45, False), # Over 30 days, no refund
        ("Smartphone", 800.00, 20, False), # Over $500, requires escalation
        ("Book", 15.00, 60, False), # Over 30 days, no refund
        ("Jacket", 80.00, 15, False), # Eligible
        ("Mystery Box", 100.00, 2, True), # Final sale
        ("TV", 600.00, 5, False), # Over $500
        ("Socks", 10.00, 1, False), # Eligible
        ("Gaming Console", 450.00, 12, False), # Eligible (under 500)
        ("Headphones", 250.00, 25, False), # Eligible
        ("Clearance Jacket", 60.00, 10, True), # Final sale
        ("Old Monitor", 300.00, 35, False), # Over 30 days
        ("Diamond Ring", 2500.00, 1, False), # Over 500, escalation
    ]

    orders_data = []
    for (c_id, email), scenario in zip(customer_ids, scenarios):
        item_name, amount, days_ago, is_final_sale = scenario
        purchase_date = (today - datetime.timedelta(days=days_ago)).isoformat()
        orders_data.append((c_id, item_name, amount, purchase_date, is_final_sale))

    cursor.executemany('''
        INSERT INTO orders (customer_id, item_name, amount, purchase_date, is_final_sale) 
        VALUES (?, ?, ?, ?, ?)
    ''', orders_data)

    conn.commit()
    conn.close()
    print("Database crm.db setup successfully with 15 mock profiles and orders.")

if __name__ == "__main__":
    setup_database()
