import matplotlib
import matplotlib.pyplot as plt
import numpy as np


labels = ['Query Type 1', 'Query Type 2', 'Query Type 3']
indices_means = [20.9836, 29.84, 124.198,
]
no_indices_means = [59.7126, 674.89, 311.451,
]

x = np.arange(len(labels))  # the label locations
width = 0.35  # the width of the bars

fig, ax = plt.subplots()
rects1 = ax.bar(x - width/2, indices_means, width, label='With Indices')
rects2 = ax.bar(x + width/2, no_indices_means, width, label='Without Indices')

# Add some text for labels, title and custom x-axis tick labels, etc.
ax.set_ylabel('Execution Time in miliseconds')
ax.set_title('Query Type')
ax.set_xticks(x)
ax.set_xticklabels(labels)
ax.legend()


def autolabel(rects):
    """Attach a text label above each bar in *rects*, displaying its height."""
    for rect in rects:
        height = rect.get_height()
        ax.annotate('{}'.format(height),
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom')


autolabel(rects1)
autolabel(rects2)

fig.tight_layout()

plt.show()