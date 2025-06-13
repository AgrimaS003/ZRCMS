from flask import Flask,jsonify,render_template,request
from db_connect import get_connection
from flask_cors import CORS
import bcrypt
from datetime import datetime
import json
import mysql.connector
import base64
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

app=Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'INTERNSHIPZRCMS'  # Use a strong secret key in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)

jwt = JWTManager(app)
STATUS_MAP = {
                        0: "Initiated",
                        1: "Under Review",
                        2: "Assign To Manager",
                        3: "Rejected By Manager",
                        4: "Assign To Supervision",
                        5: "Rejected By Supervision",
                        6: "Assign To Field Inspector",
                        7: "Rejected By Field Inspector",
                        8: "Assign To Quality Check",
                        9: "Rejected By Quality Check",
                        10: "Assign To Sales Head",
                        11: "Rejected By Sales Head",
                        12: "Assign To Director",
                        13: "Rejected By Director",
                        14: "Assign To Account",
                        15: "Rejected By Account",
                        16: "Pending",
                        17: "Claim Pass",
                        18: "Generated Voucher"
                        };
            

CORS(app, origins=["http://192.168.1.29:5173"], supports_credentials=True, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password').encode('utf-8')

    print(f"Email: {email}")

    db=get_connection()
    cursor=db.cursor(dictionary=True)
    get_user_query="select * from m_users where s_useremail=%s"
    cursor.execute(get_user_query, (email,))
    userExists=cursor.fetchone()
    db.close()

    # if userExists and bcrypt.checkpw(password,userExists['ns_pass'].encode('utf-8')):
    #     return jsonify({"output": userExists['s_useremail'], 'success':True})
    # else:
    #     return jsonify({'success':False})
    if userExists and bcrypt.checkpw(password, userExists['ns_pass'].encode('utf-8')):
        access_token = create_access_token(identity=userExists['s_useremail'])
        return jsonify({
            "access_token": access_token,
            "output": userExists,
            "success": True
        })
    else:
        return jsonify({'success': False}), 401


@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


@app.route('/user_registration', methods=['POST'])
def user_registration():
    user_data=request.get_json()
    user_name=user_data.get('Username')
    user_email=user_data.get('Email')
    user_companyname=user_data.get('Companyname')
    user_branchname=user_data.get('Branchname')
    password=user_data.get('Password').encode('utf-8')
    user_password = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')
    role=user_data.get('Role')
    user_role=int(role)
    user_status='4'
    user_last_login=datetime.now()
    user_last_ip=request.remote_addr

    db_user=get_connection()
    cursor=db_user.cursor()
    userExists="select * from m_users where s_useremail = %s"
    cursor.execute(userExists,(user_email,)) 
    userexists=cursor.fetchone()

    if userexists:
        response= {"success":False}
    else:
        insert_query="insert into m_users (s_username,s_useremail,ns_pass,s_usertype,s_status,ns_last_login,ns_last_login_ip) values (%s,%s,%s,%s,%s,%s,%s)"
        cursor.execute(insert_query,(user_name,user_email,user_password,user_role,user_status,user_last_login,user_last_ip))
        response= {"success":True}

        if (user_role==8):
            dealer_insert_query="insert into m_dealer (s_dealer_name,s_dealer_email,s_dealer_company,s_dealer_type,s_dealer_status) values (%s,%s,%s,%s,%s)"
            cursor.execute(dealer_insert_query,(user_name,user_email,user_companyname,user_role,user_status))
        
        elif (user_role==9):
            branch_insert_query="insert into m_branch (s_branch_name,s_branch_email,s_branch_company,s_branch_type,s_branch_status) values (%s,%s,%s,%s,%s)"
            cursor.execute(branch_insert_query,(user_name,user_email,user_branchname,user_role,user_status))

        else:
            staff_insert_query="insert into m_staff (s_staff_name,s_staff_email,s_department_id,s_staff_status) values (%s,%s,%s,%s)"
            cursor.execute(staff_insert_query,(user_name,user_email,user_role,user_status))

    
    db_user.commit()
    db_user.close()
    return jsonify(response)

@app.route('/dealers', methods=['GET'])
def get_dealers():
    db_dealers = get_connection()
    cursor = db_dealers.cursor(dictionary=True)
    query = """
        SELECT 
            s_dealer_id, 
            s_dealer_name, 
            s_dealer_email, 
            s_dealer_mob, 
            s_dealer_address, 
            s_dealer_company, 
            s_dealer_type, 
            s_dealer_status
        FROM m_dealer WHERE s_dealer_type = 8 OR s_dealer_type = 2
    """
    cursor.execute(query)
    dealers = cursor.fetchall()
    db_dealers.close()
    return jsonify(dealers)

@app.route('/staff',methods=['GET'])
def get_staff():
    db_staff = get_connection()
    cursor = db_staff.cursor(dictionary=True)
    query = """
        SELECT
            s_staff_id,
            s_staff_name,
            s_staff_email,
            s_staff_mobile,
            s_department_id,
            s_staff_status 
        FROM m_staff WHERE s_staff_name IS NOT NULL AND s_staff_email IS NOT NULL
    """
    
    cursor.execute(query)
    staff = cursor.fetchall()
    db_staff.close()
    return jsonify(staff)

@app.route('/branches', methods=['GET'])
def get_branches():
    db_branches = get_connection()
    cursor = db_branches.cursor(dictionary=True)
    query = """
        SELECT 
            s_branch_id, 
            s_branch_name, 
            s_branch_email, 
            s_branch_mob, 
            s_branch_type, 
            s_branch_status,
            s_branch_company
        FROM m_branch WHERE s_branch_name IS NOT NULL AND s_branch_email IS NOT NULL
    """
    cursor.execute(query)
    branches = cursor.fetchall()
    db_branches.close()
    return jsonify(branches)

@app.route('/fetchdealers', methods=['GET'])
def get_fetchdealers():
    # from flask_jwt_extended import get_jwt_identity
    # print("Accessed by:", get_jwt_identity()) 
    db_dealers = get_connection()
    cursor = db_dealers.cursor(dictionary=True)
    query = """
        SELECT 
            s_dealer_id, 
            s_dealer_name, 
            s_dealer_email, 
            s_dealer_mob, 
            s_dealer_address, 
            s_dealer_company, 
            s_dealer_type, 
            s_dealer_status
        FROM m_dealer
    """
    cursor.execute(query)
    dealers = cursor.fetchall()
    db_dealers.close()
    return jsonify(dealers)

@app.route('/products', methods=['GET'])
def get_products():
    db_products = get_connection()
    cursor = db_products.cursor(dictionary=True)
    query = """
        SELECT 
            prod_id, 
            prod_size,
            prod_name 
        FROM m_products WHERE prod_name IS NOT NULL AND prod_id IS NOT NULL
    """
    cursor.execute(query)
    products = cursor.fetchall()
    db_products.close()
    return jsonify(products)

@app.route('/status', methods=['GET'])
def get_status():
    db_status = get_connection()
    cursor = db_status.cursor(dictionary=True)
    query = """
        SELECT 
            status_id,
            status_code,
            status_name
        FROM m_status
    """
    cursor.execute(query)
    status = cursor.fetchall()
    db_status.close()
    return jsonify(status)

@app.route('/fetchusers', methods=['GET'])
def get_fetchusers():
    db_users = get_connection()
    cursor = db_users.cursor(dictionary=True)
    query = """
        SELECT
            s_user_id,      
            s_username,
            s_useremail,
            ns_pass,
            s_usertype,
            s_status,
            ns_last_login,
            ns_last_login_ip
            FROM m_users
    """
    cursor.execute(query)
    users = cursor.fetchall()
    db_users.close()
    return jsonify(users)

@app.route('/dealer_status/<int:dealer_id>', methods=['PUT'])
def update_dealer_status(dealer_id):
    data = request.get_json()
    new_status = data.get('status')
    db = get_connection()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE m_dealer SET s_dealer_status=%s WHERE s_dealer_id=%s",
        (new_status, dealer_id)
    )
    db.commit()
    db.close()
    return jsonify({"success": True, "dealer_id": dealer_id, "new_status": new_status})

@app.route('/staff_status/<int:staff_id>', methods=['PUT'])
def update_staff_status(staff_id):
    data = request.get_json()
    new_status = data.get('status')
    db = get_connection()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE m_staff SET s_staff_status=%s WHERE s_staff_id=%s",
        (new_status, staff_id)
    )
    db.commit()
    db.close()
    return jsonify({"success": True, "staff_id": staff_id, "new_status": new_status})

@app.route('/branch_status/<int:branch_id>', methods=['PUT'])
def update_branch_status(branch_id):
    data = request.get_json()
    new_status = data.get('status')
    db = get_connection()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE m_branch SET s_branch_status=%s WHERE s_branch_id=%s",
        (new_status, branch_id)
    )
    db.commit()
    db.close()
    return jsonify({"success": True, "branch_id": branch_id, "new_status": new_status})

MAINTENANCE_FILE = "maintenance.json"

@app.route('/maintenance', methods=['POST'])
def set_maintenance():
    data = request.json
    with open(MAINTENANCE_FILE, "w") as f:
        json.dump(data, f)
    return {"success": True}

@app.route('/maintenance', methods=['GET'])
def get_maintenance():
    try:
        with open(MAINTENANCE_FILE, "r") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        return {"startDate": None, "endDate": None}

@app.route('/addform', methods=['POST'])
def add_form():
    s_form_for = request.form.get('s_form_for')
    s_form_name = request.form.get('s_form_name')
    s_form_type = request.form.get('s_form_type')  # should be 'pdf'
    s_form_status = request.form.get('s_form_status')
    file = request.files.get('s_form')

    # print("file:", file)
    # print("filename:", file.filename if file else None)
    # print("content_type:", file.content_type if file else None)

    # Accept if file is present, ends with .pdf, and content_type is application/pdf
    if not file or not file.filename.lower().endswith('.pdf') or file.content_type != 'application/pdf':
        return jsonify({'success': False, 'msg': 'Only PDF files are allowed'}), 400

    s_form = file.read()

    try:
        db = get_connection()  # Replace with your DB connection function
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO m_form (s_form, s_form_name, s_form_type, s_form_for, s_form_status) VALUES (%s, %s, %s, %s, %s)",
            (s_form, s_form_name, s_form_type, s_form_for, s_form_status)
        )
        db.commit()
        cursor.close()
        db.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'msg': str(e)}), 500

@app.route("/reports", methods=["GET"])
def get_reports():
    db = get_connection()
    cursor = db.cursor()

    # Get filters from query params
    year = request.args.get('year')
    dealer = request.args.get('dealer')
    product = request.args.get('product')
    status = request.args.get('status')

    # Build WHERE clauses
    where_clauses = []
    params = []

    if year:
        # Assuming you have a date or year column, adjust as needed
        where_clauses.append("YEAR(claim_date) = %s")
        params.append(year.split('-')[0])  # e.g. "2024-25" -> "2024"
    if dealer:
        where_clauses.append("tc.s_dealer_id = %s")
        params.append(dealer)
    if product:
        where_clauses.append("msv.prod_id = %s")
        params.append(product)
    if status:
        where_clauses.append("tc.s_current_status = %s")
        params.append(status)

    # Build WHERE string
    where_str = ""
    if where_clauses:
        where_str = "WHERE " + " AND ".join(where_clauses)

    # Example: filter only total_complaints, you must add filters to all queries
    queries = {
        "total_complaints": f"SELECT count(*) FROM z_complaints_1 {where_str};",
        "total_claim_amount": f"SELECT SUM(grand_total_value) FROM m_sales_voucher {where_str};",
        "total_approved_amount": f"SELECT SUM(approved_claim_value) FROM m_sales_voucher {where_str};",
        "settled_complaints": f"""
            SELECT COUNT(DISTINCT tc.s_claim_id)
            FROM tr_claims AS tc
            JOIN tr_claimstatus AS tcs ON tc.s_claim_id = tcs.s_claim_id
            WHERE tc.s_current_status = 18 {where_str};
        """,
        "settled_claim_amount": f"""
            SELECT SUM(msv.grand_total_value)
            FROM m_sales_voucher AS msv
            JOIN tr_claims AS tc ON msv.claim_id = tc.s_claim_id
            WHERE tc.s_current_status = 18 {where_str};
        """,
        "settled_approved_amount": f"""
            SELECT SUM(msv.approved_claim_value)
            FROM m_sales_voucher AS msv
            JOIN tr_claims AS tc ON msv.claim_id = tc.s_claim_id
            WHERE tc.s_current_status = 18 {where_str};
        """,
        "accepted_complaints": f"""
            SELECT count(*)
            FROM tr_claimstatus AS tcs
            JOIN tr_claims AS tc ON tcs.s_claim_id = tc.s_claim_id
            WHERE tcs.ns_claimstatus = 14 OR tc.s_current_status = 14 {where_str};
        """,
        "accepted_claim_amount": f"""
            SELECT SUM(msv.grand_total_value)
            FROM tr_claimstatus AS tcs
            JOIN tr_claims AS tc ON tcs.s_claim_id = tc.s_claim_id
            JOIN m_sales_voucher AS msv ON tcs.s_claim_id = msv.claim_id
            WHERE tcs.ns_claimstatus = 14 OR tc.s_current_status = 14 {where_str};
        """,
        "accepted_approved_amount": f"""
            SELECT SUM(msv.approved_claim_value)
            FROM tr_claimstatus AS tcs
            JOIN tr_claims AS tc ON tcs.s_claim_id = tc.s_claim_id
            JOIN m_sales_voucher AS msv ON tcs.s_claim_id = msv.claim_id
            WHERE tcs.ns_claimstatus = 14 OR tc.s_current_status = 14 {where_str};
        """,
        "rejected_complaints": f"""
            SELECT COUNT(*)
            FROM tr_claimstatus AS tcs
            JOIN tr_claims AS tc ON tcs.s_claim_id = tc.s_claim_id
            WHERE tcs.ns_claimstatus = 3 AND tc.s_current_status = 3 {where_str};
        """,
        "rejected_claim_amount": f"""
            SELECT SUM(msv.grand_total_value)
            FROM tr_claimstatus AS tcs
            JOIN tr_claims AS tc ON tcs.s_claim_id = tc.s_claim_id
            JOIN m_sales_voucher AS msv ON tcs.s_claim_id = msv.claim_id
            WHERE tcs.ns_claimstatus = 3 AND tc.s_current_status = 3 {where_str};
        """,
        "rejected_approved_amount": f"""
            SELECT SUM(msv.approved_claim_value)
            FROM tr_claimstatus AS tcs
            JOIN tr_claims AS tc ON tcs.s_claim_id = tc.s_claim_id
            JOIN m_sales_voucher AS msv ON tcs.s_claim_id = msv.claim_id
            WHERE tcs.ns_claimstatus = 3 AND tc.s_current_status = 3 {where_str};
        """
    }

    results = {}
    for key, query in queries.items():
        cursor.execute(query, params)
        result = cursor.fetchone()[0]
        results[key] = result if result is not None else 0

    cursor.close()
    db.close()
    return jsonify(results)


@app.route('/profile', methods=['GET'])
def profile():
    db_profile = get_connection()
    cursor = db_profile.cursor(dictionary=True)
    user_email = request.args.get('s_useremail')

    # 1. Get user and usertype
    cursor.execute("SELECT * FROM m_users WHERE s_useremail = %s", (user_email,))
    user = cursor.fetchone()
    if not user:
        db_profile.close()
        return jsonify({"error": "User not found"}), 404

    usertype = str(user['s_usertype'])

    # 2. Fetch extra details based on user type
    profile_data = {
        "s_username": user.get("s_username"),
        "s_useremail": user.get("s_useremail"),
        "s_usertype": user.get("s_usertype"),
        "s_companyname": None,
        "s_usermobile": None,
        "s_useraddress": None
    }

    if usertype in ['2', '8']:  # Dealer
        cursor.execute("""
            SELECT s_dealer_company, s_dealer_mob, s_dealer_address
            FROM m_dealer
            WHERE s_dealer_email = %s
        """, (user_email,))
        dealer = cursor.fetchone()
        if dealer:
            profile_data["s_companyname"] = dealer.get("s_dealer_company")
            profile_data["s_usermobile"] = dealer.get("s_dealer_mob")
            profile_data["s_useraddress"] = dealer.get("s_dealer_address")
    elif usertype == '9':  # Branch
        cursor.execute("""
            SELECT s_branch_company, s_branch_mob, s_branch_address
            FROM m_branch
            WHERE s_branch_email = %s
        """, (user_email,))
        branch = cursor.fetchone()
        if branch:
            profile_data["s_companyname"] = branch.get("s_branch_company")
            profile_data["s_usermobile"] = branch.get("s_branch_mob")
            profile_data["s_useraddress"] = branch.get("s_branch_address")
    else:  # Staff or other
        cursor.execute("""
            SELECT s_staff_mobile, s_staff_address
            FROM m_staff
            WHERE s_staff_email = %s
        """, (user_email,))
        staff = cursor.fetchone()
        if staff:
            profile_data["s_companyname"] = None  # Or fetch department if needed
            profile_data["s_usermobile"] = staff.get("s_staff_mobile")
            profile_data["s_useraddress"] = staff.get("s_staff_address")

    db_profile.close()
    return jsonify(profile_data)


@app.route('/update_profile', methods=['POST'])
def update_profile():
    data = request.json

    # Main user fields
    name = data.get('name')
    email = data.get('email')
    company = data.get('company')
    mobile = data.get('mobile')
    address = data.get('address')

    try:
        db = get_connection()
        cursor = db.cursor(dictionary=True)

        # 1. Get user type
        cursor.execute("SELECT s_usertype FROM m_users WHERE s_useremail = %s", (email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({'success': False, 'msg': 'User not found'}), 404

        usertype = str(user['s_usertype'])

        # 2. Update m_users table
        cursor.execute("""
            UPDATE m_users
            SET s_username = %s
            WHERE s_useremail = %s
        """, (name, email))

        # Update mobile in m_staff
        cursor.execute("""
            UPDATE m_staff
            SET s_staff_mobile = %s
            WHERE s_staff_email = %s
        """, (mobile, email))

        # 3. Update the corresponding table
        if usertype in ['2', '8']:  # Dealer
            cursor.execute("""
                UPDATE m_dealer
                SET s_dealer_name = %s,
                    s_dealer_mob = %s,
                    s_dealer_address = %s,
                    s_dealer_company = %s
                WHERE s_dealer_email = %s
            """, (name, mobile, address, company, email))
        elif usertype == '9':  # Branch
            cursor.execute("""
                UPDATE m_branch
                SET s_branch_name = %s,
                    s_branch_mob = %s,
                    s_branch_address = %s,
                    s_branch_company = %s
                WHERE s_branch_email = %s
            """, (name, mobile, address, company, email))
        else:  # Staff or other
            cursor.execute("""
                UPDATE m_staff
                SET s_staff_name = %s,
                    s_staff_mobile = %s,
                    s_staff_address = %s
                WHERE s_staff_email = %s
            """, (name, mobile, address, email))

        db.commit()
        cursor.close()
        db.close()
        return jsonify({'success': True, 'msg': 'Profile updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'msg': str(e)}), 500

@app.route('/dropdowns', methods=['GET'])
def get_dropdowns():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT s_dealer_id, s_dealer_name FROM m_dealer")
    dealers = cursor.fetchall()

    cursor.execute("SELECT prod_id, prod_name FROM m_products")
    products = cursor.fetchall()

    cursor.execute("SELECT status_id, status_name FROM m_status")
    statuses = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify({
        "dealers": dealers,
        "products": products,
        "statuses": statuses
    })


@app.route('/reportsform', methods=['GET', 'POST'])
def index():
    dealers, products, statuses = get_dropdowns()
    filter_result = []

    if request.method == 'POST':
        dealer_id = request.form.get('dealer_id')
        product_id = request.form.get('product_id')
        status_name= request.form.get('status_id')

        conn = get_connection()
        cursor = conn.cursor()

        # Build dynamic query based on user input
        queries = []
        params = []

        if dealer_id:
            queries.append("s_dealer_id = %s")
            params.append(dealer_id)
        if product_id:
            queries.append("prod_id = %s")
            params.append(product_id)
        if status_name:
            queries.append("status_name = %s")
            params.append(status_name)

        # NOTE: This will only query ONE table at a time for demonstration
        if dealer_id:
            cursor.execute(f"SELECT * FROM m_dealer WHERE {' AND '.join(queries)}", params)
            filter_result = cursor.fetchall()
        elif product_id:
            cursor.execute(f"SELECT * FROM m_products WHERE {' AND '.join(queries)}", params)
            filter_result = cursor.fetchall()
        elif status_name:
            cursor.execute(f"SELECT * FROM m_status WHERE {' AND '.join(queries)}", params)
            filter_result = cursor.fetchall()

        cursor.close()
        conn.close()

@app.route('/DealerComplaintList' , methods=['GET'])
def get_dealer_complaint_list():
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    # # Get dealer_id from query params
    # dealer_id = request.args.get('dealer_id')

    # if not dealer_id:
    #     return jsonify({"error": "dealer_id is required"}), 400

    query = """
            SELECT
                zc.report_no,
                zc.complaint_added_datetime,
                md.s_dealer_name,
                md.s_dealer_mob,
                tc.s_current_status,
                md.s_dealer_email,
                zc.claim_id
                FROM dummycms.z_complaints_1 as zc
                JOIN dummycms.m_dealer as md ON zc.dealer_id = md.s_dealer_id
                JOIN dummycms.tr_claims as tc ON zc.claim_id = tc.s_claim_id;

    """
    
    cursor.execute(query)
    complaints = cursor.fetchall()

    cursor.close()
    db.close()
    
    return jsonify(complaints)

@app.route('/AssignedComplaints', methods=['GET'])
def get_assigned_complaints():
    db = get_connection()
    cursor = db.cursor(dictionary=True)
    query = """
                SELECT
                zc.report_no,
                zc.complaint_added_datetime,
                md.s_dealer_name,
                md.s_dealer_mob,
                tc.s_current_status,
                md.s_dealer_email,
                zc.claim_id
                FROM dummycms.z_complaints_1 as zc
                JOIN dummycms.m_dealer as md ON zc.dealer_id = md.s_dealer_id
                JOIN dummycms.tr_claims as tc ON zc.claim_id = tc.s_claim_id
                WHERE md.s_dealer_type = 2 AND tc.s_current_status = 2;
            """
    cursor.execute(query)
    assignedcomplaints = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(assignedcomplaints)

@app.route('/RejectedComplaints', methods=['GET'])
def get_rejected_complaints():
    db = get_connection()
    cursor = db.cursor(dictionary=True)
    query = """
                SELECT
                zc.report_no,
                zc.complaint_added_datetime,
                md.s_dealer_name,
                md.s_dealer_mob,
                tc.s_current_status,
                md.s_dealer_email,
                zc.claim_id
                FROM dummycms.z_complaints_1 as zc
                JOIN dummycms.m_dealer as md ON zc.dealer_id = md.s_dealer_id
                JOIN dummycms.tr_claims as tc ON zc.claim_id = tc.s_claim_id
                WHERE md.s_dealer_type = 2 AND tc.s_current_status = 3;
            """
    cursor.execute(query)
    rejectedcomplaints = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rejectedcomplaints)


@app.route('/BranchComplaintList', methods=['GET'])
def get_branch_complaint_list():
    db = get_connection()
    cursor = db.cursor(dictionary=True)
    query = """
            SELECT
                zc.report_no,
                zc.complaint_added_datetime,
                mb.s_branch_name,
                mb.s_branch_mob,
                tc.s_current_status,
                mb.s_branch_email,
                zc.claim_id
            FROM dummycms.z_complaints_1 as zc
            JOIN dummycms.m_branch as mb ON zc.dealer_id = mb.s_branch_id
            JOIN dummycms.tr_claims as tc ON zc.claim_id = tc.s_claim_id;
    """
    cursor.execute(query)   
    complaints = cursor.fetchall()
    cursor.close()  
    db.close()
    return jsonify(complaints)

@app.route('/DealerComplaintList/ManagerClaimView', methods=['GET'])
def get_manager_claim_view():
    try:
        db = get_connection()
        cursor = db.cursor(dictionary=True)

        claim_id = request.args.get('claim_id')
        if not claim_id:
            return jsonify({"error": "claim_id is required"}), 400

        query = """
            SELECT 
                zc.*,
                tc.s_current_status,
                md.s_dealer_id AS dealer_s_dealer_id,
                md.s_dealer_name,
                md.s_dealer_email,
                md.s_dealer_mob,
                md.s_dealer_address,
                md.s_dealer_company,
                md.s_dealer_type,
                md.s_dealer_status,
				qc.Nature_of_Complaint, 
                qc.Product, 
                qc.Application, 
                qc.Code, 
                qc.Resin_Pitch_Bonded,
                qc.Recepie, 
                qc.Styling_Machine, 
                qc.Application_of_Product_Produced_For, 
                qc.Date_of_Moulding,
                qc.Green_Stage, 
                qc.Green_Stage_date,
                qc.Curing_Stage, 
                qc.Curing_Stage_date,
                qc.Glaze_Fired_Stage,
                qc.Glaze_Fired_Stage_date, 
                qc.el_fire_stage, 
                qc.el_fire_stage_date, 
                qc.Over_All_Remarks_on_Produced_Product,
                qc.Remarks_on_Complaint, 
                qc.Remdial_Action_to_be_taken,
                tcs.ns_claimstatus,
                tcs.ns_remarks,
                tcs.s_in_staffid,
                ms.s_staff_name,
                ms.s_department_id,
                dp.s_photo_id,
                dp.s_photo_name,
                dp.s_photo_status,
                dp.ns_remarks,
                tcs.s_claim_id, 
                tcs.ns_claimstatus,
                tcs.s_updated_on,
                tcs.ns_update_type,
                tcs.ns_remarks,
                ms.s_staff_id,
                ms.s_staff_name,
                ms.s_department_id,
                md.s_dealer_id,
                md.s_dealer_name
            FROM dummycms.z_complaints_1 zc
            LEFT JOIN dummycms.tr_claims tc ON zc.claim_id = tc.s_claim_id
            LEFT JOIN dummycms.m_dealer md ON tc.s_dealer_id = md.s_dealer_id
            LEFT JOIN dummycms.m_qc_form qc ON qc.s_claimid = tc.s_claim_id
            LEFT JOIN dummycms.tr_claimstatus tcs ON tcs.s_claim_id = tc.s_claim_id
            LEFT JOIN dummycms.m_staff ms ON ms.s_staff_id = tcs.s_in_staffid
            LEFT JOIN dummycms.tr_defectivephotos dp ON dp.s_claim_id = zc.claim_id
            WHERE zc.claim_id = %s;
        """
        cursor.execute(query, (claim_id,))
        rows = cursor.fetchall()
        claim_details = rows[0] if rows else None

        cursor.close()
        db.close()
        
        if not claim_details:
            return jsonify({"error": "No record found"}), 404

        return jsonify(claim_details)
    except Exception as e:
        print("Error in /DealerComplaintList/ManagerClaimView:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/statussetbymanager',methods=['GET'])
# def status_set_by_manager():
#         claim_id = request.args.get('claimid')
#         status = request.args.get('status')
#         db = get_connection()
#         cursor = db.cursor()
#         query = """
#                 UPDATE dummycms.tr_claims
#                 SET s_current_status = %s WHERE s_claim_id = %s
#                 """
#         cursor.execute(query,(status,claim_id))
#         query = """
#                 UPDATE dummycms.tr_claimstatus
#                 SET ns_claimstatus = %s WHERE s_claim_id = %s
#                 """
#         cursor.execute(query,(status,claim_id))
#         db.commit()
#         cursor.close()
#         db.close()
#         return jsonify({"message": "Status updated successfully"}), 200
def status_set_by_manager():
    db = None  
    cursor = None 
    try:
        claim_id = request.args.get('claimid')
        status = request.args.get('status')
        s_in_staffid = request.args.get('s_in_staffid')
        s_dealer_id = request.args.get('s_dealer_id')
        for key, value in STATUS_MAP.items():
            if key == int(status):  # status is usually a string from request.args
                remarks = value
                break
        

        if not claim_id or not status:
            return jsonify({"error": "Missing claimid or status"}), 400

        db = get_connection()
        cursor = db.cursor()

        # Update current status in tr_claims
        update_claim_query = """
            UPDATE dummycms.tr_claims
            SET s_current_status = %s
            WHERE s_claim_id = %s
        """
        cursor.execute(update_claim_query, (status, claim_id))
        print("tr_claims updated, rows affected:", cursor.rowcount)

        # Check if tr_claimstatus row exists for the claim_id
        cursor.execute("SELECT 1 FROM dummycms.tr_claimstatus WHERE s_claim_id = %s", (claim_id,))
        exists = cursor.fetchone()

        if exists:
            # Update existing row
            update_status_query = """
                UPDATE dummycms.tr_claimstatus
                SET ns_claimstatus = %s,ns_remarks = %s
                WHERE s_claim_id = %s
            """
            cursor.execute(update_status_query, (status,remarks ,claim_id))
            print("tr_claimstatus updated, rows affected:", cursor.rowcount)
        else:
            # Insert new row with minimal required fields
            insert_status_query = """
                INSERT INTO dummycms.tr_claimstatus
                (s_claim_id, ns_claimstatus, s_updated_on, s_in_staffid, s_dealer_id, ns_update_type, ns_remarks)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            # Replace these default values as needed
            
            update_type = 3
            
            cursor.execute(insert_status_query, (
                claim_id, status, current_time, s_in_staffid, s_dealer_id, update_type, remarks
            ))
            print("tr_claimstatus inserted, rows affected:", cursor.rowcount)

        db.commit()

        return jsonify({"message": "Status updated successfully"}), 200

    except Exception as e:
        if db:
            db.rollback()
            cursor.close()
            db.close()
        return jsonify({"error": str(e)}), 500


@app.route('/communicationsection', methods=['GET'])
def communication_section():
    # try:
        db = get_connection()
        cursor = db.cursor(dictionary=True)
        claim_id = request.args.get('claim_id')
        print(f"Claim ID: {claim_id}")
        query = """
                SELECT 
                    tcs.s_claim_id, 
                    tcs.ns_claimstatus,
                    tcs.s_updated_on,
                    tcs.ns_update_type,
                    tcs.ns_remarks,
                    ms.s_staff_id,
                    ms.s_staff_name,
                    ms.s_department_id,
                    md.s_dealer_id,
                    md.s_dealer_name
                    FROM dummycms.tr_claimstatus as tcs 
                    LEFT JOIN dummycms.m_staff as ms ON ms.s_staff_id = tcs.s_in_staffid
                    LEFT JOIN dummycms.m_dealer as md ON md.s_dealer_id = tcs.s_dealer_id
                WHERE tcs.s_claim_id = %s;
                """
        cursor.execute(query, (claim_id,))
        communications = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify(communications)

@app.route('/DefectivePhotos', methods=['GET'])
def defective_photos():
    db = get_connection()
    cursor = db.cursor(dictionary=True)
    claim_id = request.args.get('claim_id')
    query = """
        SELECT
            dp.s_photo_id,
            dp.s_photo_name,
            dp.s_photo_status,
            dp.ns_remarks,
            dp.s_photo
        FROM dummycms.tr_defectivephotos as dp
        WHERE dp.s_claim_id = %s;
    """
    cursor.execute(query, (claim_id,))
    photos = cursor.fetchall()
    # Convert BLOB to base64 string
    for photo in photos:
        if photo['s_photo'] is not None:
            photo['s_photo'] = base64.b64encode(photo['s_photo']).decode('utf-8')
    cursor.close()
    db.close()
    return jsonify(photos)

@app.route('/putdefectivephoto/<int:s_photo_status>/<int:photo_id>', methods=['PUT'])
def put_defective_photo(s_photo_status, photo_id):
    db = get_connection()
    cursor = db.cursor()
    query = "UPDATE dummycms.tr_defectivephotos SET s_photo_status = %s WHERE s_photo_id = %s"
    cursor.execute(query, (s_photo_status, photo_id))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"success": True, "message": "Defective photo status updated successfully"})

@app.route('/passtsalesperformance', methods=['GET'])
def pass_sales_performance():
    db = get_connection()
    cursor = db.cursor(dictionary=True)
    query = """
            SELECT * FROM dummycms.tr_business_review WHERE Claim_id = %s;
            """ 
    claim_id = request.args.get('claim_id')
    if not claim_id:
        return jsonify({"error": "claim_id is required"}), 400
    cursor.execute(query, (claim_id,))
    sales_performance = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(sales_performance)  # <-- Add this line

@app.route('/stepdata' ,methods=['GET'])
def step_data():
    db = get_connection()
    cursor = db.cursor(dictionary=True)
    claim_id = request.args.get('claim_id')
    if not claim_id:
        return jsonify({"error": "claim_id is required"}), 400
    query = """
                SELECT s_updated_on,status_name FROM dummycms.tr_claimstatus as tc
                LEFT JOIN dummycms.m_status as ms ON ms.status_code = tc.ns_claimstatus
                WHERE s_claim_id = %s;
                """
    cursor.execute(query, (claim_id,))
    step_data = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(step_data)

@app.route('/claims', methods=['GET'])
def get_claims():
    db = get_connection()
    cursor = db.cursor()
    query = """
                SELECT
                    SUM(CASE WHEN s_current_status = 0 THEN 1 ELSE 0 END) AS new_claims,
                    SUM(CASE WHEN s_current_status IN (2,4,6,8,10,12,14,16) THEN 1 ELSE 0 END) AS inprocess_claims,
                    SUM(CASE WHEN s_current_status = 18 THEN 1 ELSE 0 END) AS approved_claims,
                    SUM(CASE WHEN s_current_status IN (3,5,7,9,11,13,15) THEN 1 ELSE 0 END) AS rejected_claims
                    FROM dummycms.tr_claims;
            """
    cursor.execute(query)
    claim_data = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(claim_data)

######
@app.route("/predefined_data_dealer",methods=["GET","POST"])
def predefined_data_dealer(): 
    try:
        # data=request.get_json()
        connection = get_connection()
        cursor = connection.cursor()

        dealer_id = request.args.get("dealer_id")
        
        cursor.execute("SELECT s_dealer_company, s_dealer_name FROM m_dealer WHERE s_dealer_id = %s", (dealer_id,))
        dealer_info = cursor.fetchone()
        dealer_company, dealer_name = dealer_info
        #report_id
        initials = ''.join(word[0] for word in dealer_company.split() if word).upper()
        cursor.execute("SELECT COUNT(*) FROM z_complaints_1 WHERE dealer_id = %s", (dealer_id,))
        complaint_count = cursor.fetchone()[0] + 1
        report_id = f"{initials}//{complaint_count}"

        cursor.close()
        connection.close()
        data={"report_id": report_id,"dealer_company": dealer_company,"dealer_name": dealer_name}
        return jsonify({"success": True,"data":data}), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error msg :",str(e)}), 500

@app.route("/predefined_data_branch", methods=["GET"])
def predefined_data_branch():
    try:
        connection = get_connection()
        cursor = connection.cursor()

        branch_id = request.args.get("branch_id")
        if not branch_id:
            return jsonify({"success": False, "error_msg": "branch_id is required"}), 400

        cursor.execute("SELECT s_branch_company, s_branch_name FROM m_branch WHERE s_branch_id = %s", (branch_id,))
        branch_info = cursor.fetchone()

        if not branch_info:
            return jsonify({"success": False, "error_msg": "Branch not found"}), 404

        s_branch_company, s_branch_name = branch_info

        initials = ''.join(word[0] for word in s_branch_company.split() if word).upper()
        cursor.execute("SELECT COUNT(*) FROM z_complaints_1 WHERE dealer_id = %s", (branch_id,))
        complaint_count = cursor.fetchone()[0] + 1
        report_id = f"{initials}//{complaint_count}"

        cursor.close()
        connection.close()

        data = {
            "report_id": report_id,
            "branch_company": s_branch_company,
            "branch_name": s_branch_name
        }

        return jsonify({"success": True, "data": data}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({"success": False, "error_msg": str(e)}), 500

@app.route('/fetchclaims', methods=['GET'])
def fetchclaims():
    try:
        connection = get_connection()
        cursor = connection.cursor()

        dealer_id = request.args.get("dealer_id")
        if not dealer_id:
            return jsonify({"success": False, "error": "Missing dealer_id"}), 400

        # Get count of complaints for that dealer from both tables using JOIN
        cursor.execute("""
            SELECT COUNT(z.claim_id)
            FROM dummycms.tr_claims t
            LEFT JOIN dummycms.z_complaints_1 z ON t.s_claim_id = z.claim_id
            WHERE t.s_dealer_id = %s
        """, (dealer_id,))
        complaint_count = cursor.fetchone()[0]

        # Get the max claim_id for the given dealer from tr_claims
        cursor.execute("""
            SELECT MAX(s_claim_id)
            FROM dummycms.tr_claims
        """)
        max_claim_id = cursor.fetchone()[0]

        next_claim_id = (max_claim_id or 0) + 1
        # print(next_claim_id)
        

        cursor.close()
        connection.close()

        return jsonify({
            "success": True,
            "complaint_count": complaint_count,
            "next_claim_id": next_claim_id
        }), 200

    except Exception as e:
        import traceback
        print("Error in /fetchclaims:", traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500

# @app.route("/add_complaint", methods=["POST"])
# def add_complaint():
#     try:
#         data = request.get_json()
#         print("Received data:", data)

#         conn = get_connection()
#         cursor = conn.cursor()

#          Auto-generate the next claim_id based on MAX from tr_claims
#         cursor.execute("SELECT MAX(s_claim_id) FROM dummycms.tr_claims")
#         max_claim_id = cursor.fetchone()[0]
#         next_claim_id = (max_claim_id or 0) + 1
#         data["claim_id"] = next_claim_id  # Set it in the data dict too

#         # Format complaint_added_datetime
#         iso_str = data.get('complaint_added_datetime')
#         if iso_str:
#             dt_obj = datetime.fromisoformat(iso_str.rstrip('Z'))
#             data['complaint_added_datetime'] = dt_obj.strftime('%Y-%m-%d %H:%M:%S')

#          Insert into tr_claims (only once)
#         now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
#         cursor.execute("""
#             INSERT INTO dummycms.tr_claims (s_claim_id, s_dealer_id,ns_claim_added_on,ns_last_update_on)
#             VALUES (%s, %s,%s,%s)
#         """, (next_claim_id, data.get("dealer_id"),now,now))

#         # Insert into z_complaints_1
#         insert_query = """
#         INSERT INTO z_complaints_1 (
#             claim_id, report_no, dealer_id, customer_company, customer_name, customer_mobile,
#             customer_address, segment, zircar_invoice_no, zircar_invoice_date,
#             product_name, dealer_code_no, product_code, product_brand, application, fuel,
#             working_frequency_type, working_frequency_hz, metal, metal_scrap_type, fluxes_used,
#             flux_quantity, working_temperature, top_glaze_formation, bottom_glaze_formation,
#             flame_orientation, key_bricks, support_used_at_the_bottom, metal_output_per_charges, heats_per_day,
#             melting_time_per_charge, operating_hours_per_day, type_of_opertion,
#             Installation_date, failed_date, life_expected, life_achieved,
#             competitors_name, competitors_product, Competitors_Product_Life,
#             failure_reasons, zircar_basic_price, customer_expectations_from_zircar,
#             RemarksOnFutureBusiness, complaint_added_datetime
#         )
#         VALUES (
#             %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
#             %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
#             %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
#             %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
#             %s, %s, %s, %s, %s
#         )
#         """
#         cursor.execute(insert_query, (
#             data.get('claim_id'),
#             data.get("report_no"),
#             data.get("dealer_id"),
#             data.get("customer_company"),
#             data.get("customer_name"),
#             data.get("customer_mobile"),
#             data.get("customer_address"),
#             data.get("segment"),
#             data.get("zircar_invoice_no"),
#             data.get("zircar_invoice_date"),
#             data.get("product_name"),
#             data.get("dealer_code_no"),
#             data.get("product_code"),
#             data.get("product_brand"),
#             data.get("application"),
#             data.get("fuel"),
#             data.get("working_frequency_type"),
#             data.get("working_frequency_hz"),
#             data.get("metal"),
#             data.get("metal_scrap_type"),
#             data.get("fluxes_used"),
#             data.get("flux_quantity"),
#             data.get("working_temperature"),
#             data.get("top_glaze_formation"),
#             data.get("bottom_glaze_formation"),
#             data.get("flame_orientation"),
#             data.get("key_bricks"),
#             data.get("support_used_at_the_bottom"),
#             data.get("metal_output_per_charges"),
#             data.get("heats_per_day"),
#             data.get("melting_time_per_charge"),
#             data.get("operating_hours_per_day"),
#             data.get("type_of_opertion"),
#             data.get("Installation_date"),
#             data.get("failed_date"),
#             data.get("life_expected"),
#             data.get("life_achieved"),
#             data.get("competitors_name"),
#             data.get("competitors_product"),
#             data.get("Competitors_Product_Life"),
#             data.get("failure_reasons"),
#             data.get("zircar_basic_price"),
#             data.get("customer_expectations_from_zircar"),
#             data.get("RemarksOnFutureBusiness"),
#             data.get("complaint_added_datetime")
#         ))

#         # Insert into tr_business_review if provided
#         past_sales = data.get("past_sales_performance")
#         if past_sales and isinstance(past_sales, list):
#             business_review_query = """
#                 INSERT INTO tr_business_review (
#                     Claim_id, FinancialYear, Sales, SettledClaim,
#                     ClaimPercentage, business_review_datetime
#                 ) VALUES (%s, %s, %s, %s, %s, %s)
#             """
#             for item in past_sales:
#                 dt_str = item.get("business_review_datetime")
#                 dt_mysql = None
#                 if dt_str:
#                     dt_obj = datetime.fromisoformat(dt_str.rstrip('Z'))
#                     dt_mysql = dt_obj.strftime('%Y-%m-%d %H:%M:%S')

#                 cursor.execute(business_review_query, (
#                     next_claim_id,
#                     item.get("FinancialYear"),
#                     item.get("Sales"),
#                     item.get("SettledClaim"),
#                     item.get("ClaimPercentage"),
#                     dt_mysql
#                 ))

#         conn.commit()
#         cursor.close()
#         conn.close()

#         return jsonify({'status': 'success', 'claim_id': next_claim_id}), 200

#     except Exception as e:
#         import traceback
#         print("Exception:", e)
#         print(traceback.format_exc())
#         return jsonify({"error": str(e)}), 500 

@app.route("/add_complaint", methods=["POST"])
def add_complaint():
    try:
        data = request.get_json()
        print("Received data:", data)

        def parse_datetime(date_str):
            try:
                return datetime.fromisoformat(date_str.rstrip('Z')).strftime('%Y-%m-%d %H:%M:%S')
            except Exception:
                return None

        conn = get_connection()
        cursor = conn.cursor()

        #  Auto-generate the next claim_id
        cursor.execute("SELECT MAX(s_claim_id) FROM dummycms.tr_claims")
        max_claim_id = cursor.fetchone()[0]
        next_claim_id = (max_claim_id or 0) + 1
        data["claim_id"] = next_claim_id

        #  Format date strings properly
        data['Installation_date'] = parse_datetime(data.get('Installation_date'))
        data['failed_date'] = parse_datetime(data.get('failed_date'))
        data['complaint_added_datetime'] = parse_datetime(data.get('complaint_added_datetime'))

        #  Insert into tr_claims
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute("""
            INSERT INTO dummycms.tr_claims (s_claim_id, s_dealer_id, ns_claim_added_on, ns_last_update_on)
            VALUES (%s, %s, %s, %s)
        """, (next_claim_id, data.get("dealer_id"), now, now))

        #  Insert into z_complaints_1
        insert_query = """
        INSERT INTO z_complaints_1 (
            claim_id, report_no, dealer_id, customer_company, customer_name, customer_mobile,
            customer_address, segment, zircar_invoice_no, zircar_invoice_date,
            product_name, dealer_code_no, product_code, product_brand, application, fuel,
            working_frequency_type, working_frequency_hz, metal, metal_scrap_type, fluxes_used,
            flux_quantity, working_temperature, top_glaze_formation, bottom_glaze_formation,
            flame_orientation, key_bricks, support_used_at_the_bottom, metal_output_per_charges, heats_per_day,
            melting_time_per_charge, operating_hours_per_day, type_of_opertion,
            Installation_date, failed_date, life_expected, life_achieved,
            competitors_name, competitors_product, Competitors_Product_Life,
            failure_reasons, zircar_basic_price, customer_expectations_from_zircar,
            RemarksOnFutureBusiness, complaint_added_datetime
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s
        )
        """
        cursor.execute(insert_query, (
            data.get('claim_id'),
            data.get("report_no"),
            data.get("dealer_id"),
            data.get("customer_company"),
            data.get("customer_name"),
            data.get("customer_mobile"),
            data.get("customer_address"),
            data.get("segment"),
            data.get("zircar_invoice_no"),
            data.get("zircar_invoice_date"),
            data.get("product_name"),
            data.get("dealer_code_no"),
            data.get("product_code"),
            data.get("product_brand"),
            data.get("application"),
            data.get("fuel"),
            data.get("working_frequency_type"),
            data.get("working_frequency_hz"),
            data.get("metal"),
            data.get("metal_scrap_type"),
            data.get("fluxes_used"),
            data.get("flux_quantity"),
            data.get("working_temperature"),
            data.get("top_glaze_formation"),
            data.get("bottom_glaze_formation"),
            data.get("flame_orientation"),
            data.get("key_bricks"),
            data.get("support_used_at_the_bottom"),
            data.get("metal_output_per_charges"),
            data.get("heats_per_day"),
            data.get("melting_time_per_charge"),
            data.get("operating_hours_per_day"),
            data.get("type_of_opertion"),
            data.get("Installation_date"),
            data.get("failed_date"),
            data.get("life_expected"),
            data.get("life_achieved"),
            data.get("competitors_name"),
            data.get("competitors_product"),
            data.get("Competitors_Product_Life"),
            data.get("failure_reasons"),
            data.get("zircar_basic_price"),
            data.get("customer_expectations_from_zircar"),
            data.get("RemarksOnFutureBusiness"),
            data.get("complaint_added_datetime")
        ))

        #  Insert into tr_business_review if provided
        past_sales = data.get("past_sales_performance")
        if past_sales and isinstance(past_sales, list):
            business_review_query = """
                INSERT INTO tr_business_review (
                    Claim_id, FinancialYear, Sales, SettledClaim,
                    ClaimPercentage, business_review_datetime
                ) VALUES (%s, %s, %s, %s, %s, %s)
            """
            for item in past_sales:
                dt_str = item.get("business_review_datetime")
                dt_mysql = parse_datetime(dt_str)
                cursor.execute(business_review_query, (
                    next_claim_id,
                    item.get("FinancialYear"),
                    item.get("Sales"),
                    item.get("SettledClaim"),
                    item.get("ClaimPercentage"),
                    dt_mysql
                ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'status': 'success', 'claim_id': next_claim_id}), 200

    except Exception as e:
        import traceback
        print("Exception:", e)
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route("/directordashboard", methods=["GET"])
def directordashboard():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT count(*) as Field_count FROM tr_claims WHERE s_current_status = 0")
        Field = cursor.fetchone()

        cursor.execute("SELECT count(*) as Inprocess_count FROM tr_claims WHERE s_current_status IN (2,4,6,8,10,12,14)")
        Inprocess = cursor.fetchone()

        cursor.execute("SELECT count(*) as Approved_count FROM tr_claims WHERE s_current_status = 14")
        Approved = cursor.fetchone()

        cursor.execute("SELECT count(*) as Rejected_count FROM tr_claims WHERE s_current_status IN (3,5,7,9,11,13,15)")
        Rejected = cursor.fetchone()

        cursor.execute("""
            SELECT SUM((zircar_basic_price * customer_expectations_from_zircar)/100) as Reimbursement_request
            FROM tr_claims as tc 
            JOIN z_complaints_1 as zc ON zc.claim_id = tc.s_claim_id 
            WHERE tc.s_current_status IN (0,2,4,6,8,10,12,14,16)
        """)
        Reimbursement_request = cursor.fetchone()

        cursor.execute("""
            SELECT SUM((zircar_basic_price * customer_expectations_from_zircar)/100) as Reimbursement_rejected
            FROM tr_claims as tc 
            JOIN z_complaints_1 as zc ON zc.claim_id = tc.s_claim_id 
            WHERE tc.s_current_status IN (3,5,7,9,11,13,15,17);
        """)
        Reimbursement_rejected = cursor.fetchone()

        cursor.close()
        conn.close()

        return jsonify({
            "Field_count": Field[0],
            "Inprocess_count": Inprocess[0],
            "Approved_count": Approved[0],
            "Rejected_count": Rejected[0],
            "Reimbursement_request": Reimbursement_request[0],
            "Reimbursement_rejected": Reimbursement_rejected[0]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/AllComplaintsShowDirector', methods=['GET'])
def get_all_complaints_show_director():
    db = get_connection()
    cursor = db.cursor(dictionary=True)
    query = """
            SELECT
                zc.report_no,
                zc.product_name,
                zc.zircar_basic_price,
                zc.customer_expectations_from_zircar,
                md.s_dealer_name,
                zc.claim_id
            FROM dummycms.z_complaints_1 AS zc
            JOIN dummycms.tr_claims AS tc ON zc.claim_id = tc.s_claim_id
            JOIN dummycms.m_dealer AS md ON zc.dealer_id = md.s_dealer_id
            WHERE md.s_dealer_type = 2
            AND zc.claim_id IS NOT NULL
            AND zc.report_no IS NOT NULL
            AND zc.complaint_id IS NOT NULL;

            """
    cursor.execute(query)
    allcomplaints = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(allcomplaints)

@app.route('/processedcomplaint',methods=['GET'])
def get_processed_complaint():
    db = get_connection()
    cursor = db.cursor(dictionary=True)
    query = """
                SELECT
                zc.report_no,
				tc.ns_claim_added_on,
                md.s_dealer_name,
                md.s_dealer_email,
                md.s_dealer_mob,
                zc.claim_id
            FROM dummycms.z_complaints_1 AS zc
            JOIN dummycms.tr_claims AS tc ON zc.claim_id = tc.s_claim_id
            JOIN dummycms.m_dealer AS md ON zc.dealer_id = md.s_dealer_id
            WHERE md.s_dealer_type = 2
            AND zc.claim_id IS NOT NULL
            AND zc.complaint_id IS NOT NULL AND s_current_status = 18;
            """
    cursor.execute(query)
    processedcomplaint = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(processedcomplaint)

@app.route('/unprocessedcomplaint',methods=['GET'])
def get_unprocessed_complaint():
    db = get_connection()
    cursor = db.cursor(dictionary=True)
    query = """
            SELECT
                zc.report_no,
				tc.ns_claim_added_on,
                md.s_dealer_name,
                md.s_dealer_email,
                md.s_dealer_mob,
                zc.claim_id
            FROM dummycms.z_complaints_1 AS zc
            JOIN dummycms.tr_claims AS tc ON zc.claim_id = tc.s_claim_id
            JOIN dummycms.m_dealer AS md ON zc.dealer_id = md.s_dealer_id
            WHERE md.s_dealer_type = 2
			AND zc.claim_id IS NOT NULL
			AND zc.complaint_id IS NOT NULL;
            """
    cursor.execute(query)
    unprocessedcomplaint = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(unprocessedcomplaint)

@app.route('/approvedcomplaint',methods=['GET'])
def get_approved_complaint():
    db = get_connection()
    cursor = db.cursor(dictionary=True)
    query = """
            SELECT
                zc.report_no,
				tc.ns_claim_added_on,
                md.s_dealer_name,
                md.s_dealer_email,
                md.s_dealer_mob,
                zc.claim_id
            FROM dummycms.z_complaints_1 AS zc
            JOIN dummycms.tr_claims AS tc ON zc.claim_id = tc.s_claim_id
            JOIN dummycms.m_dealer AS md ON zc.dealer_id = md.s_dealer_id
            WHERE md.s_dealer_type = 2
            AND zc.claim_id IS NOT NULL
            AND zc.complaint_id IS NOT NULL AND s_current_status = 14;
            """
    cursor.execute(query)
    approvedcomplaint = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(approvedcomplaint)


# Required fields
required_keys = [
    "DocEntry", "DocDate", "CardName", "CardCode", "Address", "DocTotal"
]
line_item_keys = [
    "LineNum", "ItemCode", "ItemDescription", "Quantity", "Price", "PriceAfterVAT",
    "CostingCode", "Currency", "WarehouseCode", "Weight1", "U_DomName",
    "U_ExpName", "U_Brand", "U_PkgType", "VatGroup"
]

@app.route('/api/invoices')
def get_invoices():
    with open('response.json') as f:
        raw_data = json.load(f)

    result = []

    for item in raw_data:
        # Get invoice-level fields
        invoice_data = {key: item.get(key, "") for key in required_keys}

        # Loop through document lines
        for line in item.get("DocumentLines", []):
            line_data = {key: line.get(key, "") for key in line_item_keys}
            combined = {**invoice_data, **line_data}
            result.append(combined)

    return jsonify(result)
            
@app.route('/api/invoiceno', methods=['GET'])
def get_invoiceno():
    dealerid = request.args.get('dealerid')
    segment = request.args.get('segment')
    print(f'Dealer ID: {dealerid}, Segment: {segment}')

    db = get_connection()
    cursor = db.cursor()

    query = """
        SELECT zircar_invoice_no, zircar_invoice_date
        FROM dummycms.z_complaints_1
        WHERE dealer_id = %s AND segment = %s
    """
    cursor.execute(query, (dealerid, segment))
    result = cursor.fetchall()

    cursor.close()
    db.close()

    # Return list of dictionaries with both invoice_no and invoice_date
    invoice_data = [
        {
            "invoiceNo": row[0],
            "invoiceDate": row[1].strftime('%Y-%m-%dT%H:%M') if row[1] else None
        }
        for row in result
    ]

    return jsonify(invoice_data)

@app.route('/api/product', methods=['GET'])
def get_product():
    zircar_invoice_no = request.args.get('zircar_invoice_no')
    zircar_invoice_date = request.args.get('zircar_invoice_date')
    print(f'zircar_invoice_no: {zircar_invoice_no}, zircar_invoice_date: {zircar_invoice_date}')

    db = get_connection()
    cursor = db.cursor()

    query = """
        SELECT product_name, product_code, product_brand
        FROM dummycms.z_complaints_1
        WHERE zircar_invoice_no = %s AND zircar_invoice_date = %s
    """
    cursor.execute(query, (zircar_invoice_no, zircar_invoice_date))
    result = cursor.fetchall()

    cursor.close()
    db.close()

    product_data = [
        {
            "product_name": row[0],
            "product_code": row[1],
            "product_brand": row[2]
        }
        for row in result
    ]

    return jsonify(product_data)


@app.route('/rejectclaimbymanager',methods=['GET'])
def rejectclaimbymanager():
    claim_id = request.args.get('claimid')
    db = get_connection()
    cursor = db.cursor()
    query = """
            UPDATE dummycms.tr_claims
            SET s_current_status = 3 WHERE s_claim_id = %s
            """
    cursor.execute(query, (claim_id,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({'message': 'Claim Rejected Successfully'})


@app.route('/dashboard/<usertype>/', methods=['POST'])
def dealer_dashboard(usertype):
    try:
        data = request.get_json()
        email = data.get('email')
        print(f"usertype:",usertype)

        if not email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400

        staff_roles = [
            'manager', 'supervisor', 'inspection', 
            'quality_check', 'sales_head', 'director', 'account'
        ]

        # Convert numeric usertype to string role
        usertype_map = {
            '1': 'admin',
            '2': 'dealer',
            '3': 'branch',
            '8': 'staff',
            '9': 'read-only'
        }

        # mapped_usertype = usertype_map.get(str(usertype), usertype)
        mapped_usertype = usertype_map.get(str(usertype), None)
        if not mapped_usertype:
            return jsonify({'success': False, 'message': 'Invalid user type'}), 400

        db = get_connection()
        cursor = db.cursor(dictionary=True)

        if mapped_usertype == 'dealer':
            cursor.execute("SELECT s_dealer_id FROM dummycms.m_dealer WHERE s_dealer_email = %s", (email,))
            dealer = cursor.fetchone()
            if not dealer:
                return jsonify({'success': False, 'message': 'Dealer not found'}), 404

            dealer_id = dealer['s_dealer_id']
            query = """
                SELECT 
                    z.report_no,
                    z.customer_name,
                    z.complaint_id,
                    z.claim_id,
                    t.s_current_status AS status_code,
                    m.status_name
                FROM dummycms.z_complaints_1 z
                LEFT JOIN dummycms.tr_claims t ON z.claim_id = t.s_claim_id
                LEFT JOIN dummycms.m_status m ON t.s_current_status = m.status_code
                WHERE z.dealer_id = %s
            """
            cursor.execute(query, (dealer_id,))
            complaints = cursor.fetchall()

        elif mapped_usertype == 'branch':
            cursor.execute("SELECT s_branch_id FROM m_branch WHERE s_branch_email = %s", (email,))
            branch = cursor.fetchone()
            if not branch:
                return jsonify({'success': False, 'message': 'Branch not found'}), 404

            branch_id = branch['s_branch_id']
            query = """
                SELECT 
                    z.report_no,
                    z.customer_name,
                    z.complaint_id,
                    z.claim_id,
                    t.s_current_status AS status_code,
                    m.status_name
                FROM dummycms.z_complaints_1 z
                LEFT JOIN dummycms.tr_claims t ON z.claim_id = t.s_claim_id
                LEFT JOIN dummycms.m_status m ON t.s_current_status = m.status_code
                WHERE z.dealer_id = %s
            """
            # This should be WHERE z.branch_id = %s if your schema uses that
            cursor.execute(query, (branch_id,))


        elif mapped_usertype in staff_roles or mapped_usertype == 'staff':
            query = """
                SELECT
                    z.report_no,
                    z.customer_name,
                    z.complaint_id,
                    z.claim_id,
                    t.s_current_status AS status_code,
                    m.status_name,
                    CASE 
                        WHEN d.s_dealer_id IS NOT NULL THEN 'Dealer'
                        WHEN b.s_branch_id IS NOT NULL THEN 'Branch'
                        ELSE 'Unknown'
                    END AS branch_type
                FROM dummycms.z_complaints_1 z
                LEFT JOIN dummycms.tr_claims t ON z.claim_id = t.s_claim_id
                LEFT JOIN dummycms.m_status m ON t.s_current_status = m.status_code
                LEFT JOIN dummycms.m_dealer d ON z.dealer_id = d.s_dealer_id
                LEFT JOIN dummycms.m_branch b ON z.dealer_id = b.s_branch_id
            """
            cursor.execute(query)
            complaints = cursor.fetchall()

        else:
            return jsonify({'success': False, 'message': 'Invalid user type'}), 400

        cursor.close()
        db.close()
        return jsonify({'success': True, 'data': complaints}), 200

    except Exception as e:
        print("Dashboard Error:", str(e))
        return jsonify({"success": False, "error_msg": str(e)}), 500

@app.route('/<usertype>/delete_complaint', methods=['POST'])
def delete_complaint(usertype):
    try:
        data = request.json
        report_no = data.get('report_no')
        db=get_connection()
        cursor = db.cursor()

        cursor.execute(
            "DELETE FROM z_complaints_1 WHERE report_no = %s",(report_no,)
        )
        db.commit()
        cursor.close()
        db.close()

        return jsonify(success=True)

    except Exception as e:
        print(f"Error in delete_complaint: {e}")
        return jsonify(success=False), 500



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5015, debug=True)