from flask import Flask, render_template, request, redirect, jsonify
from flask_cors import CORS, cross_origin
import requests
import webbrowser
import json
import os
import mysql.connector
user_details = {}
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/')
def index():

    if (request.args.get('code') == None):
        print("called")

    global user_details
    print(user_details)
    if len(user_details) != 0:
        if len(user_details['name']) > 10:
            name_abbr = user_details['name'].split()[0]
            for i in user_details['name'].split():
                if i != name_abbr:
                    name_abbr = name_abbr + " " + i[0]
                    number=user_details['phoneNumber']
                    user_details = {}
        else:
            name_abbr = user_details['name']
            number = user_details['phoneNumber']
            user_details = {}
        return render_template('index.html', name=name_abbr, number=number)
    else:
        return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])   
@cross_origin()
def login():
    return render_template('login.html')

@app.route('/callback')
def callback():
    render_template('callback.html')
    code = request.args.get('code')
    print("Received code:", code)

    if not code:
        print("Code not")
        return "No code provided", 400

    token_url = 'https://auth.delta.nitt.edu/api/oauth/token'
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': 'http://www.almamater.linkpc.net/callback',
        'client_id': 'WcL5heC7zICR7vTW',
        'client_secret': 'b5YRNrGQ6iA5dPH9SANdY.5i9VrpSbPv'
    }

    try:
        token_response = requests.post(token_url, data=data)
        print(token_response.json().get('access_token'))
        if token_response.json().get('access_token') == None:
            return redirect('/')
    except:
        return "Error connecting to the token endpoint", 500
    
    if token_response.status_code == 200:
        resources_url = 'https://auth.delta.nitt.edu/api/resources/user'
        headers = {
            'authorization': f"Bearer {token_response.json().get('access_token')}"
        }
        try:
            print("belh")
            resources_response = requests.post(resources_url, headers=headers)
        except:
            return "Error connecting to the resources endpoint", 500
    else: 
        print("bleh")
    print(type(resources_response))
    user_details.update(resources_response.json())
    return redirect('/')

all_rides = {}
market_listings = {}

try:
    with open(r".\static\market_listings.json","r") as file:
        market_file_data = json.load(file)
    market_listings = market_file_data

except:
    print("No market listings.")

try:
    with open(r".\static\all_rides.json","r") as file:
        rides_file_data = json.load(file)
    all_rides = rides_file_data

except:
    print("No rides.")

@app.route('/marketplace')
def marketplace(): 
    return render_template('marketplace.html')

@app.route('/rideshare')
def rideshare(): 
    return render_template('rideshare.html')

@app.route('/user_ride')
def user_ride(): 
    return render_template('user_ride.html')

@app.route("/api/products", methods=["GET"])
def get_products():
    try:
        return jsonify(list(market_listings.values()))
    except:
        return jsonify([])

@app.route("/api/products", methods=["POST"])
def add_product():
    data = request.get_json()

    new_id = f"prod_{len(market_listings)+1:03d}"
    market_listings[new_id] = data
    
    with open(r".\static\market_listings.json", "w") as file:
        json_string = json.dumps(market_listings)
        file.write(json_string)

    return jsonify({"message": "Product added", "product": data}), 201

@app.route("/api/rides", methods=["POST"])
def add_ride():

    data = request.get_json()

    all_rides[data['number']] = data

    with open(r".\static\all_rides.json", "w") as file:
        json_string = json.dumps(all_rides)
        file.write(json_string)

    return jsonify({"message": "Ride added", "ride": data}), 201

@app.route("/api/rides", methods=["GET"])
def get_rides():
    try:
        return jsonify(list(all_rides.values()))
    except:
        return jsonify([])

@app.route("/account")
def account():
    return render_template("account.html")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)
            