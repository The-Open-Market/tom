from statistics import mean, stdev
import matplotlib.pyplot as plt
import numpy as np
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

width = 0.25

markers = np.arange(1,6)

fig, ax = plt.subplots()
ax.bar([int(x) - 0.125 for x in markers], enc_means, width, yerr=enc_std, capsize=4, label='Encrypt')
ax.bar([int(x) - 0.125 for x in markers], upload_means, width, yerr=upload_std, bottom=enc_means, capsize=4, label='Upload')
ax.bar([int(x) + 0.125 for x in markers], download_means, width, yerr=download_std, capsize=4, label='Download')
ax.bar([int(x) + 0.125 for x in markers], dec_means, width, yerr=dec_std, bottom=download_means, capsize=4, label='Decrypt')

ax.set_ylabel('Milliseconds')
ax.set_title('Performance of Crypto and IPFS')
ax.set_xticks(markers)
ax.set_xticklabels(labels)
ax.legend()

plt.savefig("measurement.pdf", bbox_inches="tight")
