from mangum import Mangum
from main import app

# Convert FastAPI to Lambda handler
handler = Mangum(app, lifespan="off")
