from flask import Flask,jsonify,request
from db_connect import get_connection
from flask_cors import CORS
import bcrypt,base64
from datetime import datetime

app=Flask(__name__)
CORS(app)

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password').encode('utf-8')

        db=get_connection()
        cursor=db.cursor(dictionary=True)

        get_user_query="select * from m_users where s_useremail=%s"
        cursor.execute(get_user_query, (email,))
        userExists=cursor.fetchone()
        if not userExists:
            return jsonify({'success': False, "message": "User not found"}), 404
        
        stored_password=userExists['ns_pass']
        if not bcrypt.checkpw(password,stored_password.encode('utf-8')):
            return jsonify({'success':False, "message": "Invalid Password"}), 401
            
        designation_id = userExists.get('s_usertype')
        get_designation_query = "SELECT designation_name FROM m_designation WHERE designation_id=%s"
        cursor.execute(get_designation_query, (designation_id,))
        designation = cursor.fetchone()

        cursor.close()
        db.close()

        usertype = designation['designation_name']
        return jsonify({'success':True, 'email':email,'usertype':usertype}), 200

    except Exception as e:
        print(str(e))
        return jsonify({"error_msg": str(e)}), 500


@app.route('/user_registration', methods=['POST'])
def user_registration():
    try:
        user_data=request.get_json()
        user_name=user_data.get('Username')
        user_email=user_data.get('Email')
        user_companyname=user_data.get('Companyname','')
        user_branchname=user_data.get('Branchname','')
        password=user_data.get('Password').encode('utf-8')
        user_password=bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')
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
            return jsonify({"success":False, "message":"user already exists"}), 500
        
        insert_query="insert into m_users (s_username,s_useremail,ns_pass,s_usertype,s_status,ns_last_login,ns_last_login_ip) values (%s,%s,%s,%s,%s,%s,%s)"
        cursor.execute(insert_query,(user_name,user_email,user_password,user_role,user_status,user_last_login,user_last_ip))

        if (user_role==2):
            dealer_insert_query="insert into m_dealer (s_dealer_name,s_dealer_email,s_dealer_company,s_dealer_type,s_dealer_status) values (%s,%s,%s,%s,%s)"
            cursor.execute(dealer_insert_query,(user_name,user_email,user_companyname,user_role,user_status))
            
        elif (user_role==10):
            branch_insert_query="insert into m_branch (s_branch_name,s_branch_email,s_branch_company,s_branch_type,s_branch_status) values (%s,%s,%s,%s,%s)"
            cursor.execute(branch_insert_query,(user_name,user_email,user_branchname,user_role,user_status))

        else:
            staff_insert_query="insert into m_staff (s_staff_name,s_staff_email,s_department_id,s_staff_status) values (%s,%s,%s,%s)"
            cursor.execute(staff_insert_query,(user_name,user_email,user_role,user_status))
        
        db_user.commit()
        db_user.close()
        return jsonify({"success":True,"message": "Registration successful"}), 200
    
    except Exception as e:
        print(str(e))
        return jsonify({"error msg :",str(e)}), 500

######
@app.route('/<usertype>/get_profile', methods=['GET'])
def get_profile(usertype):
    try:
        email = request.args.get('email')
        db = get_connection()
        cursor = db.cursor(dictionary=True)
        # profile = None
        staff_roles = ['manager', 'supervisor', 'inspection', 'quality_check', 'sales_head', 'director', 'account']

        if usertype.lower() == 'dealer':
            cursor.execute("""
                SELECT s_dealer_name AS name, s_dealer_email AS email, s_dealer_company AS company, 
                       s_dealer_mob AS mobile, s_dealer_address AS address, s_dealer_type AS type
                FROM m_dealer 
                WHERE s_dealer_email = %s
            """, (email,))
            profile = cursor.fetchone()

        elif usertype.lower() == 'branch':
            cursor.execute("""
                SELECT s_branch_name AS name, s_branch_email AS email, s_branch_company AS company,
                       s_branch_mob AS mobile, s_branch_address AS address, s_branch_type AS type
                FROM m_branch
                WHERE s_branch_email = %s
            """, (email,))
            profile = cursor.fetchone()

        elif usertype.lower() in staff_roles:
            cursor.execute(""" 
                select s_staff_name AS name, s_staff_email AS email, s_staff_mobile AS mobile, 
                           s_staff_address AS address, s_department_id AS type
                FROM m_staff 
                where s_staff_email = %s 
                """ , (email,))
            profile = cursor.fetchone()

        else:
            # fallback to general user info in m_users (minimal info)
            cursor.execute("""
                SELECT s_username AS name, s_useremail AS email, NULL AS company, 
                       NULL AS mobile, NULL AS address, NULL AS type
                FROM m_users
                WHERE s_useremail = %s
            """, (email,))
            profile = cursor.fetchone()

        cursor.close()
        db.close()
        if profile:
            profile['usertype'] = usertype
        
        return jsonify({'success': True, 'profile': profile}), 200
        
    except Exception as e:
        print(str(e))
        return jsonify({"error_msg": str(e)}), 500
    
######
@app.route('/<usertype>/update_profile', methods=['POST'])
def update_profile(usertype):
    try:
        data=request.get_json()
        email=data.get('email')
        new_name=data.get('name')
        new_mobile=str(data.get('mobile'))
        new_address=data.get('address')
        # print("Received Data : ", data)
        staff_roles = ['manager', 'supervisor', 'inspection', 'quality_check', 'sales_head', 'director', 'account']

        db = get_connection()
        cursor = db.cursor()

        update_user_query = "UPDATE m_users SET s_username=%s WHERE s_useremail=%s"
        cursor.execute(update_user_query, (new_name, email))

        if usertype.lower() == 'dealer':
            update_query = "UPDATE m_dealer SET s_dealer_name=%s, s_dealer_mob=%s, s_dealer_address=%s WHERE s_dealer_email=%s"

        elif usertype.lower() == 'branch':
            update_query = "UPDATE m_branch SET s_branch_name=%s, s_branch_mob=%s, s_branch_address=%s WHERE s_branch_email=%s"
        
        elif usertype.lower() in staff_roles:
            update_query = "UPDATE m_staff SET s_staff_name=%s, s_staff_mobile=%s, s_staff_address=%s WHERE s_staff_email = %s"

        else:
            return jsonify({'success': False, 'message': 'Invalid user type'}), 400
        
        cursor.execute(update_query,(new_name, new_mobile, new_address, email))

        db.commit()
        cursor.close()
        db.close()

        return jsonify({'success' : True , 'message' : 'Profile updated successfully!'}), 200
    
    except Exception as e:
        print(str(e))
        return jsonify({"error msg :",str(e)}), 500

######
@app.route("/predefined_data",methods=["GET","POST"])
def predefined_data():
    try:
        data=request.get_json()
        connection = get_connection()
        cursor = connection.cursor()

        usertype = data.get("usertype")
        # print(usertype)
        user_email = data.get("dealer_email")
        if usertype.lower() == "dealer":
            cursor.execute("SELECT s_dealer_id,s_dealer_company, s_dealer_name FROM m_dealer WHERE s_dealer_email = %s", (user_email,))
            dealer_info = cursor.fetchone()
            dealer_id, dealer_company, dealer_name = dealer_info
        
        elif usertype.lower() == "branch":
            cursor.execute("select s_branch_id, s_branch_company, s_branch_name from m_branch where s_branch_email = %s", (user_email,))
            branch_info = cursor.fetchone()
            dealer_id, dealer_company,dealer_name = branch_info
        
        else:
            return jsonify({"success":False,"message":"Not dealer and branch"}), 404
        #report_id
        initials = ''.join(word[0] for word in dealer_company.split() if word).upper()
        cursor.execute("SELECT COUNT(*) FROM z_complaints_1 WHERE dealer_id = %s", (dealer_id,))
        complaint_count = cursor.fetchone()[0] + 1
        report_id = f"{initials}//{complaint_count}"

        cursor.close()
        connection.close()
        return jsonify({"success": True,"report_id": report_id,"dealer_company": dealer_company,"dealer_name": dealer_name}), 200
    
    except Exception as e:
        print(str(e))
        return jsonify({"error_msg :":str(e)}), 500


######
@app.route('/<usertype>/register_complaint' , methods = ['POST'])
def register_complaint(usertype):
    try:
        data=request.form
        files=request.files
        # print("Received complaint data : ",data)
        now=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        connection = get_connection()
        cursor = connection.cursor()
        if usertype.lower() == 'dealer':
            dealer_email = data.get("dealer_email")
            cursor.execute("SELECT s_dealer_id,s_dealer_company, s_dealer_name FROM m_dealer WHERE s_dealer_email = %s", (dealer_email,))
            dealer_info = cursor.fetchone()

            if dealer_info:
                dealer_id, dealer_company, dealer_name = dealer_info
            else:
                dealer_id = data.get("dealer_id")
                dealer_company = data.get("dealer_company_name")
                # dealer_name = data.get("dealer_name")

            insert_claim_query="INSERT INTO tr_claims (s_dealer_id, ns_claim_added_on, ns_last_update_on) VALUES ( %s, %s, %s)"
            cursor.execute(insert_claim_query,(dealer_id,now,now ))
        
        elif usertype.lower() == 'branch':
            branch_email = data.get('dealer_email')
            cursor.execute("SELECT s_branch_id, s_branch_company, s_branch_name FROM m_branch WHERE s_branch_email = %s", (branch_email,))
            branch_info = cursor.fetchone()
        
            if branch_info:
                branch_id, branch_company, branch_name = branch_info
            # else:
            #     branch_id = data.get("dealer_id")
            #     branch_company = data.get("dealer_company_name")
            dealer_id = branch_id
            insert_claim_query = """
                INSERT INTO tr_claims (s_dealer_id, ns_claim_added_on, ns_last_update_on)
                VALUES (%s, %s, %s)
            """
            cursor.execute(insert_claim_query, (branch_id, now, now))
        else:
            return jsonify({"success":False,"error": "Invalid usertype"}), 400
        
        claim_id=cursor.lastrowid
        insert_status_query = """
            INSERT INTO tr_claimstatus 
            (s_claim_id, ns_claimstatus, s_updated_on, s_dealer_id)
            VALUES (%s, %s, %s, %s) """
        cursor.execute(insert_status_query,(claim_id, 0, now, dealer_id, ))

        complaint_data = {
            "claim_id": claim_id,
            "complaint_id": data.get("complaint_id"),
            "report_no": data.get("report_id"),
            "dealer_id": dealer_id,
            "customer_company": data.get('customer_company'),
            "customer_name": data.get("customer_name"),
            "customer_mobile": data.get("mobileNumber"),
            "customer_address": data.get("address"),
            "segment": data.get("segment"),
            "zircar_invoice_no": data.get("invoice_no"),
            "zircar_invoice_date": data.get("invoice_date"),
            "product_name": data.get("product_name"),
            "dealer_code_no": data.get("code_no"),
            "product_code": data.get("code_no"),
            "product_brand": data.get("product_brand"),
            "application": data.get("application"),
            "fuel": data.get("fuel_type"),
            "working_frequency_type": data.get("working_frequency_type"),
            "working_frequency_hz": data.get("working_frequency_hz"),     
            "metal": data.get("metal"),
            "metal_scrap_type": data.get("metal_scrap_type"),
            "fluxes_used": data.get("fluxes"),
            "flux_quantity": data.get("flux_quantity"),
            "working_temperature": data.get("working_temperature"),
            "top_glaze_formation": data.get("top_glaze"),
            "bottom_glaze_formation": data.get("bottom_glaze"),
            "flame_orientation": data.get("flame_orientation"),
            "key_bricks": data.get("key_bricks"),
            "finished_product": data.get("finished_product"),
            "support_used_at_the_bottom": data.get("support_at_bottom"),
            "metal_output_per_charges": data.get("metal_output"),
            "heats_per_day": data.get("heats_per_day"),
            "melting_time_per_charge": data.get("melting_time"),
            "operating_hours_per_day": data.get("operating_hours"),
            "type_of_opertion": data.get("type_of_operation"),
            "Installation_date": data.get("installation"),
            "failed_date": data.get("failed"),
            "life_expected": data.get("life_expected"),
            "life_expected_data": data.get("life_expected_data"),
            "life_achieved": data.get("life_achieved"),
            "life_achieved_data": data.get("life_achieved_data"),
            "competitors_name": data.get("competitor_name"),
            "competitors_product": data.get("competitor_product"),
            "Competitors_Product_Life": data.get("competitor_product_life"),
            "Competitors_Product_Life_data": data.get("competitor_product_life_data"),
            "failure_reasons": data.get("failure_reasons"),
            "whether_inspected_by_dealer": data.get("inspected_by_dealer"),
            "whether_inspected_by_zircar": data.get("inspected_by_zircar"),
            "name_of_inspector": data.get("inspector_name"),
            "visit_reports_of_dealer": data.get("dealer_report"),
            "visit_reports_of_zircar_employee": data.get("zircar_report"),
            "zircar_basic_price": data.get("zircar_basic_price"),
            "customer_expectations_from_zircar": data.get("customer_expectations"),
            "OutstandingAsOnDate": data.get("outstanding"),
            "RemarksOnFutureBusiness": data.get("remarks"),
            "complaint_added_datetime": now
        }
        photo_fields = [
            ('point_image', 'Point Image'),
            ('full_view_image', 'Full View Image'),
            ('reference_location_image', 'Reference Location Image'),
            ('top_view_image', 'Top View Image'),
            ('bottom_view_image', 'Bottom View Image'),
        ]

        insert_query = """
            INSERT INTO z_complaints_1 (
                claim_id, complaint_id, report_no, dealer_id, customer_company, customer_name,
                customer_mobile, customer_address, segment, zircar_invoice_no, zircar_invoice_date,
                product_name, dealer_code_no, product_code, product_brand, application, fuel,
                working_frequency_type, working_frequency_hz, metal, metal_scrap_type, fluxes_used,
                flux_quantity, working_temperature, top_glaze_formation, bottom_glaze_formation,
                flame_orientation, key_bricks, finished_product, support_used_at_the_bottom,
                metal_output_per_charges, heats_per_day, melting_time_per_charge, operating_hours_per_day,
                type_of_opertion, Installation_date, failed_date, life_expected, life_expected_data,
                life_achieved, life_achieved_data, competitors_name, competitors_product,
                Competitors_Product_Life, Competitors_Product_Life_data, failure_reasons,
                whether_inspected_by_dealer, whether_inspected_by_zircar, name_of_inspector,
                visit_reports_of_dealer, visit_reports_of_zircar_employee, zircar_basic_price,
                customer_expectations_from_zircar, OutstandingAsOnDate, RemarksOnFutureBusiness,
                complaint_added_datetime
            )
            VALUES (
                %(claim_id)s, %(complaint_id)s, %(report_no)s, %(dealer_id)s, %(customer_company)s, %(customer_name)s,
                %(customer_mobile)s, %(customer_address)s, %(segment)s, %(zircar_invoice_no)s, %(zircar_invoice_date)s,
                %(product_name)s, %(dealer_code_no)s, %(product_code)s, %(product_brand)s, %(application)s, %(fuel)s,
                %(working_frequency_type)s, %(working_frequency_hz)s, %(metal)s, %(metal_scrap_type)s, %(fluxes_used)s,
                %(flux_quantity)s, %(working_temperature)s, %(top_glaze_formation)s, %(bottom_glaze_formation)s,
                %(flame_orientation)s, %(key_bricks)s, %(finished_product)s, %(support_used_at_the_bottom)s,
                %(metal_output_per_charges)s, %(heats_per_day)s, %(melting_time_per_charge)s, %(operating_hours_per_day)s,
                %(type_of_opertion)s, %(Installation_date)s, %(failed_date)s, %(life_expected)s, %(life_expected_data)s,
                %(life_achieved)s, %(life_achieved_data)s, %(competitors_name)s, %(competitors_product)s,
                %(Competitors_Product_Life)s, %(Competitors_Product_Life_data)s, %(failure_reasons)s,
                %(whether_inspected_by_dealer)s, %(whether_inspected_by_zircar)s, %(name_of_inspector)s,
                %(visit_reports_of_dealer)s, %(visit_reports_of_zircar_employee)s, %(zircar_basic_price)s,
                %(customer_expectations_from_zircar)s, %(OutstandingAsOnDate)s, %(RemarksOnFutureBusiness)s,
                %(complaint_added_datetime)s
            )"""
        
        insert_photo_query = """INSERT INTO tr_defectivephotos 
        (s_photo_name, s_photo, s_photo_type, s_claim_id, s_photo_status, ns_photo_added_on, ns_photo_added_by, ns_remarks)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""

        cursor.execute(insert_query, complaint_data) 

        for field_name, photo_name in photo_fields:
            if field_name in files:
                file = files[field_name]
                if file:
                    file_content = file.read()
                    cursor.execute(insert_photo_query, ( photo_name, file_content, file.content_type, claim_id, '0', now, dealer_id, 'NA'))

        if 'extra_images' in request.files:
            extra_files = request.files.getlist('extra_images')

            for file in extra_files:
                file_bytes = file.read()
                # file_base64 = base64.b64encode(file_bytes).decode('utf-8')

                insert_attachment = """
                    INSERT INTO m_attachments
                    ( s_clid, s_docname, ns_content, ns_doctype, s_docstatus, s_uploadtime, ns_remarks)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(insert_attachment, (dealer_id, file.filename, file_bytes, 'image', '0', now, 'NA' ))
        # Insert Business Review Data
        financial_years = ['2022-2023', '2023-2024', '2024-2025', '2025-2026']
        insert_review_query = """
        INSERT INTO tr_business_review
        (Claim_id, FinancialYear, Sales, SettledClaim, ClaimPercentage, business_review_datetime)
        VALUES (%s, %s, %s, %s, %s, %s)
        """

        for fy in financial_years:
            sales_field = f'sales_{fy.replace("-", "_")}'
            settled_field = f'settled_{fy.replace("-", "_")}'
            claim_field = f'claim_{fy.replace("-", "_")}'

            sales = data.get(sales_field)
            settled = data.get(settled_field)
            claim_percentage = data.get(claim_field)

            # Insert into table
            cursor.execute(insert_review_query, (
                claim_id, fy, sales, settled, claim_percentage, now
            ))

        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"success": True, "message": "Complaint registered successfully!"}), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error_msg ":str(e)}), 500
    
######
@app.route('/<usertype>/dashboard', methods=['POST'])
def dealer_dashboard(usertype):
    try:
        data = request.get_json()
        email=data.get('email')
        staff_roles = ['manager', 'supervisor', 'inspection', 'quality_check', 'sales_head', 'director', 'account']
        # print(usertype)
        db=get_connection()
        cursor = db.cursor(dictionary=True)

        if usertype == 'dealer':
            cursor.execute("SELECT s_dealer_id FROM m_dealer WHERE s_dealer_email = %s", (email,))
            dealer = cursor.fetchone()
            dealer_id = dealer['s_dealer_id']

            query = """
            SELECT 
                z.report_no,
                z.customer_name,
                z.complaint_id,
                z.claim_id,
                ts.ns_claimstatus AS status_code,
                m.status_name
            FROM z_complaints_1 z
            LEFT JOIN (
                SELECT ts.s_claim_id, ts.ns_claimstatus
                FROM tr_claimstatus ts
                JOIN (
                    SELECT s_claim_id, MAX(s_updated_on) AS latest_update
                    FROM tr_claimstatus
                    WHERE s_dealer_id = %s
                    GROUP BY s_claim_id
                ) latest ON ts.s_claim_id = latest.s_claim_id AND ts.s_updated_on = latest.latest_update
            ) ts ON z.claim_id = ts.s_claim_id
            LEFT JOIN m_status m ON ts.ns_claimstatus = m.status_code
            WHERE z.dealer_id = %s
            """
            cursor.execute(query, (dealer_id, dealer_id))

            complaints = cursor.fetchall()
            cursor.close()
            db.close()
            return jsonify({'success': True, 'data': complaints}), 200
    
        elif usertype == 'branch':
        # Get branch ID first
            cursor.execute("SELECT s_branch_id FROM m_branch WHERE s_branch_email = %s", (email,))
            branch = cursor.fetchone()
            branch_id = branch['s_branch_id']

            query = """
            SELECT 
                z.report_no,
                z.customer_name,
                z.complaint_id,
                z.claim_id,
                ts.ns_claimstatus AS status_code,
                m.status_name
            FROM z_complaints_1 z
            LEFT JOIN (
                SELECT ts.s_claim_id, ts.ns_claimstatus
                FROM tr_claimstatus ts
                JOIN (
                    SELECT s_claim_id, MAX(s_updated_on) AS latest_update
                    FROM tr_claimstatus
                    WHERE s_dealer_id = %s
                    GROUP BY s_claim_id
                ) latest ON ts.s_claim_id = latest.s_claim_id AND ts.s_updated_on = latest.latest_update
            ) ts ON z.claim_id = ts.s_claim_id
            LEFT JOIN m_status m ON ts.ns_claimstatus = m.status_code
            WHERE z.dealer_id = %s
            """
            cursor.execute(query, (branch_id, branch_id))

            complaints = cursor.fetchall()
            cursor.close()
            db.close()
            return jsonify({'success': True, 'data': complaints}), 200
    
        elif usertype in staff_roles:
            query = """
            SELECT 
                z.report_no,
                z.customer_name,
                z.complaint_id,
                z.claim_id,
                ts.ns_claimstatus AS status_code,
                m.status_name,
                CASE 
                    WHEN d.s_dealer_id IS NOT NULL THEN 'Dealer'
                    WHEN b.s_branch_id IS NOT NULL THEN 'Branch'
                    ELSE 'Unknown'
                END AS branch_type
            FROM z_complaints_1 z
            LEFT JOIN (
                SELECT ts.s_claim_id, ts.ns_claimstatus
                FROM tr_claimstatus ts
                JOIN (
                    SELECT s_claim_id, MAX(s_updated_on) AS latest_update
                    FROM tr_claimstatus
                    GROUP BY s_claim_id
                ) latest ON ts.s_claim_id = latest.s_claim_id AND ts.s_updated_on = latest.latest_update
            ) ts ON z.claim_id = ts.s_claim_id
            LEFT JOIN m_status m ON ts.ns_claimstatus = m.status_code
            LEFT JOIN m_dealer d ON z.dealer_id = d.s_dealer_id
            LEFT JOIN m_branch b ON z.dealer_id = b.s_branch_id
            """
            cursor.execute(query)

            complaints = cursor.fetchall()
            cursor.close()
            db.close()
            return jsonify({'success': True, 'data': complaints}), 200
        
        else:
            # Handle unknown usertype
            cursor.close()
            db.close()
            return jsonify({'success': False, 'message': 'Invalid user type'}), 400

    except Exception as e:
        print(str(e))
        return jsonify({"error_msg ":str(e)}), 500

######
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
        

@app.route('/<usertype>/active_complaints', methods=['POST'])
def active_complaints(usertype):
    try:
        data = request.get_json()
        email = data.get('email')
        print(email)
        print(usertype)

        db = get_connection()
        cursor = db.cursor(dictionary=True)

        if usertype.lower() == "dealer":
            cursor.execute("SELECT s_dealer_id FROM m_dealer WHERE s_dealer_email = %s", (email,))
            result = cursor.fetchone()
            user_id_field = 'dealer_id'
            user_id_value = result['s_dealer_id']

        elif usertype.lower() == "branch":
            cursor.execute("select s_branch_id from m_branch where s_branch_email = %s", (email,))
            result = cursor.fetchone()
            print(result)
            user_id_field = 'dealer_id'
            user_id_value = result['s_branch_id']

        else:
            return jsonify({"success":False, "message":"Not dealer and branch"})
        
        allowed_status_codes = (0, 1, 2, 4, 6, 8, 10, 12, 14, 16)
        placeholders = ','.join(['%s'] * len(allowed_status_codes))

        query = f""" SELECT 
            z.report_no,
            z.customer_name,
            z.customer_address,
            t.s_current_status AS status_code,
            m.status_name 
        FROM z_complaints_1 z
        LEFT JOIN tr_claims t ON z.claim_id = t.s_claim_id
        LEFT JOIN m_status m ON t.s_current_status = m.status_code
        WHERE z.{user_id_field} = %s AND t.s_current_status IN ({placeholders})
        """

        cursor.execute(query, (user_id_value, *allowed_status_codes))
        complaints = cursor.fetchall()
        cursor.close()
        db.close()

        return jsonify({'success':True,'data':complaints}), 200
    
    except Exception as e:
        print(str(e))
        return jsonify({"error_msg": str(e)}), 500
    

@app.route('/<usertype>/rejected_complaints', methods=['POST'])
def rejected_complaints(usertype):
    try:
        data = request.get_json()
        email = data.get('email')
        print(email)
        print(usertype)
        db = get_connection()
        cursor = db.cursor(dictionary=True)

        if usertype.lower() == "dealer":
            cursor.execute("SELECT s_dealer_id FROM m_dealer WHERE s_dealer_email = %s", (email,))
            result = cursor.fetchone()
            user_id_field = 'dealer_id'
            user_id_value = result['s_dealer_id']
        
        elif usertype.lower() == "branch":
            cursor.execute("select s_branch_id from m_branch where s_branch_email = %s", (email,))
            result = cursor.fetchone()
            print(result)
            user_id_field = 'dealer_id'
            user_id_value = result['s_branch_id']
        
        else:
            return jsonify({"success":False, "message":"Not dealer and branch"}), 404

        rejected_status_codes = (3, 5, 7, 9, 11, 13, 15)
        placeholders = ','.join(['%s'] * len(rejected_status_codes))

        query = f""" SELECT 
            z.report_no,
            z.customer_name,
            z.customer_address,
            t.s_current_status AS status_code,
            m.status_name
        FROM z_complaints_1 z
        LEFT JOIN tr_claims t ON z.claim_id = t.s_claim_id
        LEFT JOIN m_status m ON t.s_current_status = m.status_code
        WHERE z.{user_id_field} = %s AND t.s_current_status IN ({placeholders})"""

        cursor.execute(query, (user_id_value, *rejected_status_codes))
        complaints = cursor.fetchall()

        cursor.close()
        db.close()
        return jsonify({'success': True, 'data': complaints}), 200

    except Exception as e:
        print(str(e))
        return jsonify({"error_msg": str(e)}), 500


@app.route('/<usertype>/claim_passed', methods=['POST'])
def claim_passed(usertype):
    try:
        data = request.get_json()
        email = data.get('email')

        db=get_connection()
        cursor=db.cursor(dictionary=True)

        if usertype.lower() == "dealer":
            query="select s_dealer_id from m_dealer where s_dealer_email = %s"
            cursor.execute(query,(email,))
            result = cursor.fetchone()
            user_id = result['s_dealer_id']
        
        elif usertype.lower() == "branch":
            query = "select s_branch_id from m_branch where s_branch_email = %s"
            cursor.execute(query,(email,))
            result = cursor.fetchone()
            user_id = result['s_branch_id']

        else:
            return jsonify({"success":False, "message":"Not dealer and branch"})

        claim_passed_status_code=18
        claim_query=""" SELECT 
                    z.report_no,
                    z.customer_name,
                    z.customer_address,
                    t.s_current_status AS status_code,
                    m.status_name
                    from z_complaints_1 z
                    LEFT JOIN tr_claims t ON z.claim_id = t.s_claim_id
                    LEFT JOIN m_status m ON t.s_current_status = m.status_code
                    WHERE z.dealer_id = %s AND t.s_current_status = %s """
        
        cursor.execute(claim_query,(user_id,claim_passed_status_code))
        complaints = cursor.fetchall()
        cursor.close()
        db.close()

        return jsonify({'success':True,'data':complaints}),200

    except Exception as e:
        print(str(e))
        return jsonify({"error_msg":str(e)}), 500

######
# @app.route('/<usertype>/get_claim_data', methods=['POST'])
# def get_claim_data(usertype):
#     try:
#         data = request.get_json()       
#         email=data.get('email')
#         claim_id=data.get('claim_id')
#         db=get_connection()
#         cursor = db.cursor(dictionary=True)

#         if usertype.lower() == 'dealer':
#             query = "SELECT s_dealer_id AS user_id, s_dealer_name AS user_name, s_dealer_company AS user_company FROM m_dealer WHERE s_dealer_email = %s"
#         elif usertype.lower() == 'branch':
#             query = "SELECT s_branch_id AS user_id, s_branch_name AS user_name, s_branch_company AS user_company FROM m_branch WHERE s_branch_email = %s"
#         else:
#             return jsonify({"success": False, "message": "Invalid usertype"}), 400

#         cursor.execute(query,(email,))
#         user=cursor.fetchone()
#         user_id=user['user_id']
#         user_name = user['user_name']
#         user_company = user['user_company']

#         complaint_query="select * from z_complaints_1 where claim_id = %s AND dealer_id = %s"
#         cursor.execute(complaint_query,(claim_id, user_id,))
#         complaint_info=cursor.fetchone()

#         complaint_info['dealer_name'] = user_name
#         complaint_info['dealer_company'] = user_company
        
#         table_data_query = """
#             SELECT FinancialYear, Sales, SettledClaim, ClaimPercentage
#             FROM tr_business_review
#             WHERE Claim_id = %s
#             ORDER BY FinancialYear
#         """
#         cursor.execute(table_data_query, (claim_id,))
#         table_data = cursor.fetchall()
#         complaint_info['table_data'] = table_data

#         cursor.close()
#         db.close()
#         return jsonify({'success':True, 'data':complaint_info}), 200
    
#     except Exception as e:
#         print(str(e))
#         return jsonify({"error_msg" : str(e)}), 500


@app.route('/<usertype>/get_claim_data', methods=['POST'])
def get_claim_data(usertype):
    try:
        data = request.get_json()       
        email = data.get('email')
        input_id = data.get('claim_id')  # This is report_no for staff, claim_id otherwise

        db = get_connection()
        cursor = db.cursor(dictionary=True)

        staff_roles = ['manager', 'supervisor', 'inspection', 'quality_check', 'sales_head', 'director', 'account']
        usertype_lower = usertype.lower()

        complaint_info = None

        # Case 1: STAFF → convert report_no to claim_id
        if usertype_lower in staff_roles:
            cursor.execute("SELECT claim_id FROM z_complaints_1 WHERE report_no = %s", (input_id,))
            row = cursor.fetchone()
            if not row:
                return jsonify({"success": False, "message": "Invalid report_no"}), 404
            claim_id = row['claim_id']
            complaint_query = "SELECT * FROM z_complaints_1 WHERE claim_id = %s"
            cursor.execute(complaint_query, (claim_id,))
            complaint_info = cursor.fetchone()
            if complaint_info:
                dealer_id = complaint_info.get('dealer_id')
                cursor.execute("SELECT s_dealer_name, s_dealer_company FROM m_dealer WHERE s_dealer_id = %s", (dealer_id,))
                dealer = cursor.fetchone()

                if dealer:
                    complaint_info['dealer_name'] = dealer['s_dealer_name']
                    complaint_info['dealer_company'] = dealer['s_dealer_company']
                else:
                    # If not found in dealer, try branch table
                    cursor.execute("SELECT s_branch_name, s_branch_company FROM m_branch WHERE s_branch_id = %s", (dealer_id,))
                    branch = cursor.fetchone()
                    if branch:
                        complaint_info['dealer_name'] = branch['s_branch_name']
                        complaint_info['dealer_company'] = branch['s_branch_company']


        # Case 2: DEALER
        elif usertype_lower == 'dealer':
            cursor.execute("SELECT s_dealer_id, s_dealer_name, s_dealer_company FROM m_dealer WHERE s_dealer_email = %s", (email,))
            user = cursor.fetchone()
            if not user:
                return jsonify({"success": False, "message": "Dealer not found"}), 404

            claim_id = input_id
            cursor.execute("SELECT * FROM z_complaints_1 WHERE claim_id = %s AND dealer_id = %s", (claim_id, user['s_dealer_id']))
            complaint_info = cursor.fetchone()
            if complaint_info:
                complaint_info['dealer_name'] = user['s_dealer_name']
                complaint_info['dealer_company'] = user['s_dealer_company']

        # Case 3: BRANCH
        elif usertype_lower == 'branch':
            cursor.execute("SELECT s_branch_id, s_branch_name, s_branch_company FROM m_branch WHERE s_branch_email = %s", (email,))
            user = cursor.fetchone()
            if not user:
                return jsonify({"success": False, "message": "Branch not found"}), 404

            claim_id = input_id
            cursor.execute("SELECT * FROM z_complaints_1 WHERE claim_id = %s AND dealer_id = %s", (claim_id, user['s_branch_id']))
            complaint_info = cursor.fetchone()
            if complaint_info:
                complaint_info['dealer_name'] = user['s_branch_name']
                complaint_info['dealer_company'] = user['s_branch_company']

        else:
            return jsonify({"success": False, "message": "Invalid usertype"}), 400

        if not complaint_info:
            return jsonify({"success": False, "message": "Complaint not found"}), 404

        # Business review table
        table_data_query = """
            SELECT FinancialYear, Sales, SettledClaim, ClaimPercentage
            FROM tr_business_review
            WHERE Claim_id = %s
            ORDER BY FinancialYear
        """
        cursor.execute(table_data_query, (claim_id,))
        table_data = cursor.fetchall()
        complaint_info['table_data'] = table_data

        cursor.close()
        db.close()

        return jsonify({'success': True, 'data': complaint_info}), 200

    except Exception as e:
        print(str(e))
        return jsonify({"error_msg": str(e)}), 500


######
# @app.route('/<usertype>/get_photos',methods=['POST'])
# def get_photos(usertype):
    try:
        data=request.get_json()
        email=data.get('email')
        claim_id=data.get('claim_id')

        db = get_connection()
        cursor=db.cursor(dictionary=True)

        if usertype.lower() == 'dealer':
            id_query = """
                SELECT s_dealer_id AS id, s_dealer_name AS name, s_dealer_company AS company
                FROM m_dealer
                WHERE s_dealer_email = %s
            """
        elif usertype.lower() == 'branch':
            id_query = """
                SELECT s_branch_id AS id, s_branch_name AS name, s_branch_company AS company
                FROM m_branch
                WHERE s_branch_email = %s
            """
        else:
            return jsonify({"success": False, "error_msg": "Not dealer and branch"}), 400

        cursor.execute(id_query,(email,))
        result=cursor.fetchone()

        result_id = result['id']

        photo_query = """SELECT 
                        p.s_photo_id,
                        p.s_photo_name,
                        p.s_photo,
                        p.s_photo_type,
                        ps.`status_name` AS s_photo_status,
                        p.ns_remarks
                    FROM tr_defectivephotos p
                    LEFT JOIN photo_status ps ON p.s_photo_status = ps.status_code
                    WHERE p.s_claim_id = %s """
        cursor.execute(photo_query,(claim_id,))
        photos=cursor.fetchall()

        for photo in photos:
            if photo['s_photo']:
                encoded_photo = base64.b64encode(photo['s_photo']).decode('utf-8')
                photo['s_photo_base64'] = f"data:{photo['s_photo_type']};base64,{encoded_photo}"
            else:
                photo['s_photo_base64'] = None
            # Optionally remove raw bytes from response:
            photo.pop('s_photo', None)
            
        cursor.close()
        db.close()
        return jsonify({"success":True,"photos":photos}),200

    except Exception as e:
        print(str(e))
        return jsonify({"error_msg":str(e)}), 500

@app.route('/<usertype>/get_photos', methods=['POST'])
def get_photos(usertype):
    try:
        data = request.get_json()
        print("Request Data:", data)

        email = data.get('email')
        claim_id = data.get('claim_id')  # This is report_no only for staff roles
        print("Email:", email)
        print("Claim ID (or report_no for staff):", claim_id)

        if not claim_id:
            return jsonify({"success": False, "message": "Missing claim_id"}), 400

        staff_roles = ['manager', 'supervisor', 'inspection', 'quality_check', 'sales_head', 'director', 'account']
        db = get_connection()
        cursor = db.cursor(dictionary=True)

        usertype_lower = usertype.lower()

        # Step 1: Handle staff roles — convert report_no to actual claim_id
        if usertype_lower in staff_roles:
            cursor.execute("SELECT claim_id FROM z_complaints_1 WHERE report_no = %s", (claim_id,))
            row = cursor.fetchone()
            if not row:
                return jsonify({"success": False, "message": "Invalid report_no for staff"}), 404
            actual_claim_id = row['claim_id']
        else:
            # For dealer/branch, assume claim_id is already valid
            actual_claim_id = claim_id

        # Step 2: Define photo query
        photo_query = """
            SELECT 
                p.s_photo_id,
                p.s_photo_name,
                p.s_photo,
                p.s_photo_type,
                p.s_photo_status,
                ps.status_name,
                p.ns_remarks
            FROM tr_defectivephotos p
            LEFT JOIN photo_status ps ON p.s_photo_status = ps.status_code
            WHERE p.s_claim_id = %s
        """

        # Step 3: Role-based access
        if usertype_lower in staff_roles:
            # Staff can access any claim
            cursor.execute(photo_query, (actual_claim_id,))

        elif usertype_lower == 'dealer':
            id_query = """
                SELECT s_dealer_id AS id FROM m_dealer WHERE s_dealer_email = %s
            """
            cursor.execute(id_query, (email,))
            if not cursor.fetchone():
                return jsonify({"success": False, "message": "Dealer not found"}), 404

            cursor.execute(photo_query, (actual_claim_id,))

        elif usertype_lower == 'branch':
            id_query = """
                SELECT s_branch_id AS id FROM m_branch WHERE s_branch_email = %s
            """
            cursor.execute(id_query, (email,))
            if not cursor.fetchone():
                return jsonify({"success": False, "message": "Branch not found"}), 404

            cursor.execute(photo_query, (actual_claim_id,))

        else:
            return jsonify({"success": False, "message": "Invalid usertype"}), 400

        # Step 4: Format result
        photos = cursor.fetchall()
        for photo in photos:
            if photo['s_photo']:
                encoded = base64.b64encode(photo['s_photo']).decode('utf-8')
                photo['s_photo_base64'] = f"data:{photo['s_photo_type']};base64,{encoded}"
            else:
                photo['s_photo_base64'] = None
            photo.pop('s_photo', None)

        cursor.close()
        db.close()

        return jsonify({"success": True, "photos": photos}), 200

    except Exception as e:
        print("Exception:", str(e))
        return jsonify({"error_msg": str(e)}), 500

######
@app.route('/<usertype>/update_photo',methods=['POST'])
def update_photo(usertype):
    try:
        s_photo_id=request.form['s_photo_id']
        s_claim_id=request.form['s_claim_id']
        file = request.files['photo']
        # print(s_photo_id)
        # print(s_claim_id)
        file_bytes = file.read()
        file_type = file.content_type
        file_name = file.filename

        db = get_connection()
        cursor = db.cursor()
        now=datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if usertype.lower() not in ['dealer', 'branch']:
            return jsonify({'success': False, 'message': 'Not dealer and branch'}), 400

        photo_update_query = """ update tr_defectivephotos
                                set s_photo = %s,
                                s_photo_type = %s,
                                s_photo_name = %s,
                                ns_photo_added_on = %s,
                                s_photo_status = 1
                                where s_photo_id =%s and s_claim_id = %s
                            """
        cursor.execute(photo_update_query,(file_bytes,file_type,file_name,now,s_photo_id,s_claim_id))
        db.commit()
        cursor.close()
        db.close()
        return jsonify({'success':True}), 200

    except Exception as e:
        print(str(e))
        return jsonify({"error_msg":str(e)}),500

@app.route('/<usertype>/delete_photo', methods=['POST'])
def delete_photo(usertype):
    try:
        data = request.get_json()
        s_photo_id = data.get('s_photo_id')
        s_claim_id = data.get('s_claim_id')

        if usertype not in ['dealer', 'branch']:
            return jsonify({"success":False, "message": "Not dealer and branch"}), 400

        db = get_connection()
        cursor = db.cursor()
        delete_query = "DELETE FROM tr_defectivephotos WHERE s_photo_id = %s AND s_claim_id = %s"
        cursor.execute(delete_query, (s_photo_id, s_claim_id))
        db.commit()
        cursor.close() 
        db.close()
        return jsonify({'success':True}), 200
    
    except Exception as e:
        print(str(e))
        return jsonify({"error_msg":str(e)}), 500
    
######
# @app.route('/<usertype>/claim_timeline', methods=['POST'])
# def claim_timeline(usertype):
#     try:
#         data=request.get_json()
#         claim_id = data.get('claim_id')

#         db = get_connection()
#         cursor = db.cursor(dictionary=True)
#         query = """
#             SELECT 
#                 ms.status_name AS description,
#                 tc.ns_last_update_on AS timestamp
#             FROM tr_claims tc
#             JOIN m_status ms ON tc.s_current_status = ms.status_code
#             WHERE tc.s_claim_id = %s
#             ORDER BY tc.ns_last_update_on ASC
#         """
#         cursor.execute(query, (claim_id,))
#         result = cursor.fetchall()
#         return jsonify({"success": True, "events": result}), 200

#     except Exception as e:
#         print(str(e))
#         return jsonify({"error_msg":str(e)}), 500


# @app.route('/<usertype>/claim_timeline', methods=['POST'])
# def claim_timeline(usertype):
#     try:
#         data = request.get_json()
#         input_id = data.get('claim_id')  # May be claim_id or report_no

#         db = get_connection()
#         cursor = db.cursor(dictionary=True)

#         # Staff roles
#         staff_roles = ['manager', 'supervisor', 'inspection', 'quality_check', 'sales_head', 'director', 'account']
#         usertype_lower = usertype.lower()

#         # Resolve claim_id if staff
#         if usertype_lower in staff_roles:
#             cursor.execute("SELECT claim_id FROM z_complaints_1 WHERE report_no = %s", (input_id,))
#             row = cursor.fetchone()
#             if not row:
#                 return jsonify({"success": False, "message": "Invalid report_no for staff"}), 404
#             claim_id = row['claim_id']
#         else:
#             claim_id = input_id

#         # Fetch all rows for this claim_id to build the timeline
#         query = """
#             SELECT 
#                 ms.status_name AS description,
#                 tc.ns_last_update_on AS timestamp
#             FROM tr_claims tc
#             JOIN m_status ms ON tc.s_current_status = ms.status_code
#             WHERE tc.s_claim_id = %s
#             ORDER BY tc.ns_last_update_on ASC
#         """
#         cursor.execute(query, (claim_id,))
#         timeline_entries = cursor.fetchall()

#         return jsonify({"success": True, "events": timeline_entries}), 200

#     except Exception as e:
#         print("Error in claim_timeline:", str(e))
#         return jsonify({"success": False, "error_msg": str(e)}), 500


@app.route('/<usertype>/claim_timeline', methods=['POST'])
def claim_timeline(usertype):
    try:
        data = request.get_json()
        input_id = data.get('claim_id')  # May be claim_id or report_no

        db = get_connection()
        cursor = db.cursor(dictionary=True)

        # Staff roles
        staff_roles = ['manager', 'supervisor', 'inspection', 'quality_check', 'sales_head', 'director', 'account']
        usertype_lower = usertype.lower()

        # Resolve claim_id if staff
        if usertype_lower in staff_roles:
            cursor.execute("SELECT claim_id FROM z_complaints_1 WHERE report_no = %s", (input_id,))
            row = cursor.fetchone()
            if not row:
                return jsonify({"success": False, "message": "Invalid report_no for staff"}), 404
            claim_id = row['claim_id']
        else:
            claim_id = input_id

        # New query using tr_claimstatus
        query = """
            SELECT 
                ms.status_name AS description,
                tcs.s_updated_on AS timestamp,
                tcs.s_in_staffid,
                tcs.s_dealer_id,
                tcs.ns_update_type,
                tcs.ns_remarks
            FROM tr_claimstatus tcs
            JOIN m_status ms ON tcs.ns_claimstatus = ms.status_code
            WHERE tcs.s_claim_id = %s
            ORDER BY tcs.s_updated_on ASC
        """
        cursor.execute(query, (claim_id,))
        timeline_entries = cursor.fetchall()

        return jsonify({"success": True, "events": timeline_entries}), 200

    except Exception as e:
        print("Error in claim_timeline:", str(e))
        return jsonify({"success": False, "error_msg": str(e)}), 500


######
@app.route('/<usertype>/all_complaint_list', methods=['POST'])
def all_complaint_list(usertype):
    try: 
        query = """SELECT 
                z.report_no AS claim_id,
                z.complaint_added_datetime AS claim_date,
                z.customer_name AS dealer_name,
                z.customer_mobile AS dealer_mobile,
                COALESCE(d.s_dealer_email, b.s_branch_email) AS dealer_email
            FROM 
                z_complaints_1 z
            LEFT JOIN 
                m_dealer d ON z.dealer_id = d.s_dealer_id
            LEFT JOIN 
                m_branch b ON (d.s_dealer_id IS NULL AND z.dealer_id = b.s_branch_id)
            ORDER BY
                z.complaint_added_datetime DESC;"""

        db = get_connection()
        cursor = db.cursor()
        cursor.execute(query)
        complaints = cursor.fetchall()

        complaints_list = []
        for complaint in complaints:
            complaints_list.append({
                'claim_id': complaint[0],
                'claim_date': complaint[1].strftime('%Y-%m-%d') if complaint[1] else None,
                'dealer_name': complaint[2],
                'dealer_mobile': complaint[3],
                'dealer_email': complaint[4]
            })
        return jsonify({"success": True,"complaints":complaints_list}), 200

    except Exception as e:
        print(str(e))
        return jsonify({"error_msg":str(e)}), 500


######
@app.route('/<usertype>/update_photo_status', methods=['POST'])
def update_photo_status(usertype):
    try:
        data = request.get_json()
        print("Received data:", data)  # Log incoming data

        s_photo_id = data.get('s_photo_id')
        status_code = data.get('status_code')

        if not s_photo_id or status_code is None:
            print("Missing s_photo_id or status_code")
            return jsonify({"success": False, "error": "Missing s_photo_id or status_code"}), 400

        db = get_connection()
        cursor = db.cursor()

        cursor.execute(
            "UPDATE tr_defectivephotos SET s_photo_status = %s WHERE s_photo_id = %s",
            (status_code, s_photo_id)
        )
        db.commit()

        print("Updated photo", s_photo_id, "with status", status_code)
        return jsonify({"success": True}), 200

    except Exception as e:
        print("Server error:", str(e))  # log the actual server error
        return jsonify({"success": False, "error": str(e)}), 500

######
@app.route('/branch/monthly_complaints',methods=['POST'])
def monthly_complaints():
    try:
        db = get_connection()
        cursor = db.cursor(dictionary=True)
        query = """
            SELECT 
                MONTH(complaint_added_datetime) AS month,
                COUNT(*) AS count
            FROM z_complaints_1
            GROUP BY MONTH(complaint_added_datetime)
            ORDER BY month
        """
        cursor.execute(query)
        result = cursor.fetchall()
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

if __name__=='__main__':
    app.run(host='0.0.0.0', port=5015,debug=True) 