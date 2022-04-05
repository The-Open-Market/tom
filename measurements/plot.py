import matplotlib.pyplot as plt
import json

with open('result.json', 'r') as f:
    data = json.load(f)

print(data)