a3-robthomp-samw11
===============

# Exploring Song Data by Artist Rating and Year

## Team Members

1. Sam Wilson, samw11@cs
2. Robert Thompson, robthomp@cs

## Running Instructions
You can access our visualization at http://homes.cs.washington.edu/~samw11/ (it may run slowly the first time) or download the repository and run it on a server with PHP installed. We used the [MAMP package](http://www.mamp.info/en/index.html) during development if you want a suggestion.

## Description
The visualization is divided into three layers. The first layer is a pair of polar scatterplots of artists binned on year, popularity rating, and hotness rating. Point size is dependent on the number of artists in that bin. Points are twice on the upper and lower half-circle graphs. Year is decided radius for both but the top graph maps hotness while the bottom graph maps familiarity. Mousing over a point will show a tooltip with point year, hotness, familiarity, and the number of artists in that bin. The corresponding point on the opposing half-circle graph will also be highlighted.

Clicking a point will transition to the second layer, a bubble graph, that shows more detail about the artists in that bin, including the number of songs they released that year and the average duration of those songs. Mousing over a bubble will display the full artist name, the number of songs they produced that year, and the average duration of those songs in seconds.

Clicking an artist bubble will display the full song information the database has on them, including all of their songs sorted by year and then title and each song's duration. Clicking outside of the second layer bubble graph will transition back to the first visualization layer scatterplot.

## Dataset
The data domain we used for our visualization is Million Song Dataset. The dataset contains collections of audio features and metadata for a million contemporary popular music tracks. Since the full dataset is very large, approximately 300GB, we tried to work on a 1% subset of the dataset, which was still greater than 2.5GB and ultimately still too large. Eventually we decided to use a subset with most of the metadata filtered out to only the song title, album, artist name, duration of the song in seconds, artist familiarity, artist hotness and the year of the song. The final song total is approximately 500,000, half of the original database. Unlike the original dataset, the artist familiarity and the artist hotness are from 1 to 10 rather than 0 to 1.

Here are a few tableau visualizations of the full dataset that influenced our design decisions.

![Songs per year histogram](https://raw.github.com/CSE512-14W/a3-robthomp-samw11/blob/master/img/songsperyear.png)
A measure of the number of songs produced per year.

![Bubble graph of artists in the dataset](https://raw.github.com/CSE512-14W/a3-robthomp-samw11/blob/master/img/artistbubble.png)
A bubble graph of all artists in the dataset. Bubble size is the number of songs while color shows artist hotness.

![Artist hotness vs song year](https://raw.github.com/CSE512-14W/a3-robthomp-samw11/blob/master/img/hotnessperyear.png)
A scatterplot of song artist hotness vs year.

![Song duration vs year](https://raw.github.com/CSE512-14W/a3-robthomp-samw11/blob/master/img/durationvsyear.png)
A scatterplot of song duration vs year.

## Planning
Based on the dataset, features presented above, we wanted to build a visualization that could accommodate the large number of records in the dataset and still allow users to explore the data fully. We decided pretty quickly to have several hierarchical visualization layers, each reducing the dataset further, until we could eventually display individual song titles. Our task was then choosing dimensions that had interesting trends on their own but could also reduce the data significantly when fixed. We found the increasing variety of song duration and artist ‘Hotness/Familiarity’ over time to be some of the more interesting trends and decided to highlight those features. Our sketches below show different attempts at visualizing duration but the vast majority of songs were in a narrow range (2-10mins) and songs within that range exhibited few interesting trends. Eventually we decided to use the hotness and familiarity measures instead, and to show them in scatterplot. We also liked the bubble graph of artists but felt it was far too dense when displaying the whole dataset. Thus, we decided to use a bubble graph as a secondary visualization layer after filtering the data based on hotness, familiarity, and year. Once we had a useable bubble graph of artists, a third layer simply listing the artist’s songs felt obvious. 

## Story Board
Apologies for the poor quality. These were done on physical paper in pencil and then scanned. 

### Rejected Designs
First, a selection of designs that did not end up being implemented.

![Tree Vis](https://raw.github.com/CSE512-14W/a3-robthomp-samw11/blob/master/img/DOC0018.png)
A textual tree visualization.

![Map](https://raw.github.com/CSE512-14W/a3-robthomp-samw11/blob/master/img/DOC0019.png)
A map showing artist location data (from another dataset we did not use).

![Stacked Area](https://raw.github.com/CSE512-14W/a3-robthomp-samw11/blob/master/img/DOC0017.png)
Stacked area graph with data binned by song duration.

![Text Search](https://raw.github.com/CSE512-14W/a3-robthomp-samw11/blob/master/img/DOC0016.png)
Text field to search by artist name.

![Radial Hist](https://raw.github.com/CSE512-14W/a3-robthomp-samw11/blob/master/img/DOC0014.png)
Radial histogram binned by song duration.

![Radial Hist 2](https://raw.github.com/CSE512-14W/a3-robthomp-samw11/blob/master/img/DOC0013.png)
Another version of the radial histogram, this time also showing a histogram of popularity within each duration bin.

### Final Designs
Now the sketches that became the basis for the final product.

![Radial Scatterplot](https://raw.github.com/CSE512-14W/a3-robthomp-samw11/blob/master/img/DOC00113.png)
The radial scatterplot used as the first visualization layer.

![Cartesian Scatterplot](https://raw.github.com/CSE512-14W/a3-robthomp-samw11/blob/master/img/DOC00112.png)
An earlier sketch showing a cartesian scatterplot but also showing the bubble graph second layer and text window third layer.

![Transition Animation](https://raw.github.com/CSE512-14W/a3-robthomp-samw11/blob/master/img/DOC00111.png)
A sketch of the zooming animation that occurs when clicking a bubble and the corresponding animation in the text window.


## Development
Below is the first draft of the first layer visualization. The x axis is the year and the y axis is the number of hotness / familiarity. As you can see, there are a lot of clusters. In addition, there are many overlapping with each other. 

![First Draft](https://raw.github.com/CSE512-14W/a3-robthomp-samw11/blob/master/img/scatterplot.png)

At this point we realized the dataset was still too large and had to devise methods to lessen the load on the browser. We decided to use PHP to parse the necessary information and only then send it to the D3 visualization code running in the browser. PHP proved to be too slow to parse the data so we opted to bin the data based on our first visualization layer dimensions: year, hotness, and familiarity, and create separate data files for each bin. This reduced the number of points we had to draw on the first visualization layer scatter plot and also dramatically sped up the loading time for the second and third layers. To create a more consistent look, we also changed the scatter plot to polar coordinates to better match the bubble graph.

We also discovered that there are some inconsistencies in the dataset. For example, we assumed that the artist familiarity number would be the same for all entries. However, that is not true. We find out that the artist familiarity numbers are not always the same with the same artist. Similar errors occur for artist hotness. Since there are too many artists, we were unable to correct the dataset and had to keep the errors in.

Below shows the polar coordinates version of the first layer. Comparing with the scatterplot version, we thought this visualization looked much better. We also started to work on the color at this point. After the color lecture, we both agreed not to use blue for the color scale. The final color schemes were chosen with the (Color Brewer 2)[http://colorbrewer2.org/] website and we decided to use red on the first layer and green on the second layer. Regarding the background color, we originally chose black as a background color for the first layer. It looked cool but did not work for the second layer. Since we needed consistency between layers we end up using white as a background color for everything.
![Second Draft](https://raw.github.com/CSE512-14W/a3-robthomp-samw11/blob/master/img/radialscatterplot.png)

Finalization mostly involved merging the two visualization layers we had developed separately and creating a consistent look between them. Transitions had to suggest the first layer was ‘zooming in’ to the second layer and the opposite when going from the second to the first layer.

### Changes between Storyboard and the Final Implementation

There are many changes from the initial sketches to the final visualization. There were a lot of issues with the data we did not anticipate, particularly size. As a result, we had to filter and bin the dataset in order to let our visualization run smoothly. 

Regarding the first layer, we decided to use scatterplot from the start. After looking at the first draft of the first layer, we decided to change it to a variation of a bubble chart as bubble is the main theme of our visualization.

### Comments
The full database and the first subset we attempted to use were in a format foreign to both of us: HDF5. We actually spent most of the first week just trying to get the data into a format D3 could read. Eventually we had to give up and go with a different subset that contained fewer data fields but was already in CSV format. Once we had the data, as mentioned above, the sheer size of it was a constant concern and obstacle. We didn’t anticipate having to make a PHP back-end at first, or having to bin the data into separate files. Handling all of this, including arranging the data ourselves and writing scripts to parse it, took a sizeable portion of our time. 

Writing the actual visualization code was fairly straightforward and quick thanks to very helpful D3 examples. Styling the visualizations away from their default look took a long time, however, as did making transitions between the different layers.

### Time Breakdown

Time spent:
*Converting dataset format: 20 hours
*Filtering and binning the dataset: 12 hours
*Dataset backend scripts: 6 hours
*Design layout: 6 hours
*Learning and implementation: 24 hours
*Styling and coloring: 5 hours
*Fix bugs: 2 hour
*Refactoring: 1 hour

### Division of Labor:

Sam:
* 1st visualization layer
* Filter and bin the dataset
* Transition between layer 1 and 2

Rob:
* 2nd and 3rd visualization layers.
* Backend PHP scripts for 2nd and 3rd layers.
* Also worked on 1->2 and 2->1 transitions


## Libraries and 3rd Party Code Used
* D3
* D3-tip
* jQuery
* D3’s Zoomable Circle Packing Example
* D3’s Bar Chart with Tooltip Example
* D3’s Bubble Chart Example

