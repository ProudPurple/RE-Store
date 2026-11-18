from dotenv import load_dotenv
load_dotenv()

import gallery
from pipeline import Restorer
from web import create_app

WEB_DIR = '../frontend/RE-Store/dist'

restorer = Restorer()
app = create_app(restorer.run, gallery.load_groups, WEB_DIR)