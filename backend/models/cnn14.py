import torch
import torch.nn as nn
import torch.nn.functional as F


class ConvBlock(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()

        self.conv1 = nn.Conv2d(
            in_channels,
            out_channels,
            kernel_size=3,
            padding=1,
            bias=False,
        )

        self.conv2 = nn.Conv2d(
            out_channels,
            out_channels,
            kernel_size=3,
            padding=1,
            bias=False,
        )

        self.bn1 = nn.BatchNorm2d(out_channels)
        self.bn2 = nn.BatchNorm2d(out_channels)

    def forward(self, x, pool_size=(2, 2)):
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        x = F.avg_pool2d(x, pool_size)
        return x


class CNN14(nn.Module):
    """
    CNN14 architecture for audio classification.

    Expected input:
        (batch_size, 1, 256, 431)

    Output:
        (batch_size, num_classes)
    """

    def __init__(self, num_classes):
        super().__init__()

        self.bn0 = nn.BatchNorm2d(1)

        self.block1 = ConvBlock(1, 64)
        self.block2 = ConvBlock(64, 128)
        self.block3 = ConvBlock(128, 256)
        self.block4 = ConvBlock(256, 512)
        self.block5 = ConvBlock(512, 1024)
        self.block6 = ConvBlock(1024, 2048)

        self.fc1 = nn.Linear(2048, 2048)
        self.fc_out = nn.Linear(2048, num_classes)

        self.dropout = nn.Dropout(0.7)

    def forward(self, x):

        x = self.bn0(x)

        x = self.block1(x, pool_size=(2, 2))
        x = self.block2(x, pool_size=(2, 2))
        x = self.block3(x, pool_size=(2, 2))
        x = self.block4(x, pool_size=(2, 2))
        x = self.block5(x, pool_size=(2, 2))
        x = self.block6(x, pool_size=(1, 1))

        # Global Average Pooling + Global Max Pooling
        x_avg = x.mean(dim=[2, 3])
        x_max = x.amax(dim=[2, 3])

        x = x_avg + x_max

        x = self.dropout(F.relu(self.fc1(x)))
        x = self.fc_out(x)

        return x