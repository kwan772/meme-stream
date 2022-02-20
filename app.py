from flask import Flask,render_template,send_from_directory,request, jsonify, make_response
import pandas as pd
import requests
from flask_cors import CORS, cross_origin
import datetime
from os.path import exists
import os

app = Flask(__name__ 
    ,static_folder='client/build',static_url_path='')
cors = CORS(app)

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route("/members")
@cross_origin()
def members(): 
    memeData = pd.read_csv('memeBase.csv',error_bad_lines=False)
    memeJson = memeData.to_json()
    return memeJson

@app.route("/checkImage")
@cross_origin()
def checkImage(): 
    src = request.args.get("src")
    print(src)
    r = requests.get(src)
    print(r.status_code)
    return str(r.status_code)

@app.route("/updateMeme")
@cross_origin()
def updateMeme():
    CLIENT_ID = 'QkDNs7eGBfuqvm8zljd_Rg'
    SECRET_KEY = '-QNzDm4geXSCbMvdkTYOynWAKSa8pQ'

    auth = requests.auth.HTTPBasicAuth(CLIENT_ID, SECRET_KEY)

    with open('redditpw.txt','r') as f:
        pw = f.read()

    data = {
        'grant_type' : 'password',
        'username' : 'NeighborhoodHungry60',
        'password' : pw
    }

    headers = {'User-Agent' : 'MyAPI/0.0.1'}
    res = requests.post('https://www.reddit.com/api/v1/access_token',
                        auth=auth, data=data, headers=headers)

    TOKEN = res.json()['access_token']
    headers['Authorization'] = f'bearer {TOKEN}'

    csv_name = 'meme'+ datetime.date.today().strftime("%m-%d-%Y") +'.csv'

    for sbred in ['AdviceAnimals','MemeEconomy','ComedyCemetery','memes','dankmemes']:

        res = requests.get('https://oauth.reddit.com/r/'+ sbred + '/hot',
                        headers=headers, params={'limit':'100'})
        df = pd.DataFrame()
        for post in res.json()['data']['children']:
            if not post['data']['over_18']:
                df=df.append({
                    'title': post['data']['title'],
                    'time':datetime.datetime.fromtimestamp(post['data']['created_utc']),
                    'selftext': post['data']['selftext'],
                    'upvote': post['data']['upvote_ratio'],
                    'score': post['data']['score'],
                    'media' : post['data']['url'],
                    'vid': post['data']['media'],
                }, ignore_index=True)

    return df.to_string()



if __name__ == '__main__':
    app.run(host='0.0.0.0')