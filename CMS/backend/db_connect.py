import mysql.connector
def get_connection():
    return mysql.connector.connect(
        host="coder-edgestg.com",
        user="intern",
        password="root",
        database="dummycms",
        port="33416"
    )
 