from flask import Flask
import pandas as pd
import requests
import datetime
from os.path import exists
import os
from flask import request

app = Flask(__name__)

@app.route("/members")
def members(): 
    memeData = pd.read_csv('memeBase.csv',error_bad_lines=False)
    memeJson = memeData.to_json()
    return memeJson

@app.route("/checkImage")
def checkImage(): 
    src = request.args.get("src")
    print(src)
    r = requests.get(src)
    print(r.status_code)
    return str(r.status_code)

@app.route("/updateMeme")
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

        if exists(csv_name):
            df.to_csv(path_or_buf=csv_name,mode='a')
        else:
            df.to_csv(path_or_buf=csv_name)
        after = post['kind']+'_'+post['data']['id']
        count = 1
        while count!=100:
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
                print(count)
                res = requests.get('https://oauth.reddit.com/r/'+sbred+'/hot',
                                headers=headers, params={'limit': '100', 'after':after})

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
                df.to_csv(path_or_buf=csv_name,mode='a')
                after = post['kind']+'_'+post['data']['id']
                print(df)
                count+=1
                if df.empty:
                    break

    df = pd.read_csv(csv_name,error_bad_lines=False,delimiter=',')
    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
    #df.columns = ['meida','score','selftext','time','title','upvote','vid']

    df.drop(df[df.upvote=="upvote"].index, inplace=True)
    #df.upvote = float(df.upvote)
    df.upvote = df.upvote.astype(float)
    df.score = df.score.astype(float)

    #print(df.astype({'upvote': 'float64'},errors='ignore',copy=False).dtypes)
    #df.drop(df[df.upvote < 0.8].index, inplace=True)
    df = df[df.upvote>0.8]


    df = df[df.score > 100]


    df = df[['media','score','selftext','title','upvote']]

    df.to_csv(path_or_buf=csv_name)

    if not os.path.isfile('memeBase.csv'):
        df.to_csv(path_or_buf='memeBase.csv')
    else:
        df.to_csv(path_or_buf='memeBase.csv',mode='a', header=False)

    return ""



if __name__ == "__main__":
    app.run(debug=True)