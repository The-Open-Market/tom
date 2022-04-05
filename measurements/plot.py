from statistics import mean, stdev
import matplotlib.pyplot as plt
import json


def _get(data, index):
    # Maps the array of measurements into single values depending on index
    return [[xs[index] for xs in xss] for xss in data.values()]


def _mean(data, index):
    return [mean(values) for values in _get(data, index)]


def _stdev(data, index):
    return [stdev(values) for values in _get(data, index)]


with open('result.json', 'r') as f:
    data = json.load(f)


labels = data.keys()

enc_means = _mean(data, 0)
enc_std = _stdev(data, 0)

upload_means = _mean(data, 1)
upload_std = _stdev(data, 1)

download_means = _mean(data, 2)
download_std = _stdev(data, 2)

dec_means = _mean(data, 3)
dec_std = _stdev(data, 3)

width = 0.5

fig, ax = plt.subplots()
ax.bar(labels, enc_means, width, yerr=enc_std, label='Encrypt')
ax.bar(labels, upload_means, width, yerr=upload_std, bottom=enc_means, label='Upload')
ax.bar(labels, download_means, width, yerr=download_std, bottom=[a + b for (a, b) in zip(upload_means, enc_means)], label='Download')
ax.bar(labels, dec_means, width, yerr=dec_std, bottom=[a + b + c for (a, b, c) in zip(upload_means, enc_means, download_means)], label='Decrypt')

ax.set_ylabel('Milliseconds')
ax.set_title('Performance of crypto and IPFS')
ax.legend()

plt.savefig("measurement.png")
