import os
import webbrowser
import requests
from html.parser import HTMLParser

def logon(username, password):
	s = requests.Session()
	r = s.get('https://studentportalen.uu.se/portal/portal/uusp?uusp.doLogin=true')

	postData = {
		'j_username':username,
		'j_password':password,
		'_eventId_proceed': 'Login',
	}

	r = s.post(r.url, data=postData)

	url = 'https://studentportalen.uu.se/portal/portal/uusp/student/student-uppdok-result?uusp.portalpage=true&mode=show_studies_result'
	r = s.get(url)
	print(r.text)

	return s, r

def showResponseInBrowser(r):
	path = os.path.abspath('temp.html')
	localUrl = 'file://' + path

	html = r.text

	with open(path, 'w') as f:
		f.write(r.text)
		webbrowser.open(localUrl)

if __name__ == '__main__':
	username = os.environ['STUDENTPORTAL_USERNAME']
	password = os.environ['STUDENTPORTAL_PASSWORD']
	logon(username, password)
