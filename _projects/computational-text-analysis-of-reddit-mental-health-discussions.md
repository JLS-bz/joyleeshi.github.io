---
layout: page
title: Computational Text Analysis of Mental Health Discussions on Reddit 
img: assets/img/dissociation.jpg
importance: 5
#category: work
related_publications: true
---

## Project Overview

**Status**: Archived 

This project explored the use of computational methods for analyzing large-scale online discussions of mental health. Using publicly available Reddit data, I experimented with approaches for collecting, processing, analyzing, and visualizing text from communities focused on mental health and related experiences.

The project began with an exploratory analysis of discussions about depersonalization and derealization and later expanded to include multiple mental-health-related communities. Analyses explored methods including web scraping, text preprocessing, word and n-gram analysis, topic modeling, time-based comparisons, sentiment analysis, and approaches for supporting qualitative thematic analysis.

This page serves as an archive of the analyses, methodological notes, code development, and exploratory work completed throughout the project.

## Table of Contents 

- [Web-Scraping Reddit Data](#web-scraping-reddit-data)
- [Exploratory Analysis of r/dpdr with R](#exploratory-analysis-of-rdpdr)
- [Topic Modeling of r/dpdr with TF-IDF and LDA](#topic-modeling-of-rdpdr-with-tf-idf-and-lda)
- [Time-based Group Comparisons of Mental Health Disorder Discussions](#time-based-group-comparisons-of-mental-health-disorder-discussions)
- [What is Sentiment Analysis?](#what-is-sentiment-analysis)

## Web-Scraping Reddit Data

*2023-02-06*

An easy way to retrieve data from Reddit is through the PushShift.io API Wrapper [**PMAW**](https://github.com/mattpodolak/pmaw), [**PSAW**](https://psaw.readthedocs.io/en/latest/), or [**PRAW**](https://praw.readthedocs.io/en/stable/). Unfortunately, these wrappers do not have access to posts in certain timeframes.

As a result, files.PushShift.io is utilized due to its 100% operational status as seen [here](https://stats.uptimerobot.com/l8RZDu1gBG). Screenshot taken on Jan 17, 2023:

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/Pushshift_status.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

#### The following scripts were used:

**1.**  [filePushshiftpull.py](https://github.com/JLS-bz/JLS-bz.github.io/blob/main/scripts/filePushshiftpull.py)
  - Automates the downloading of compressed .zst files from [files.pushshift.io](https://files.pushshift.io/reddit/submissions/). 
  - Date range: **2019-11 to 2021-02**
  
**2.**  PushshiftDumps by Watchful1

a) [combine_folder_multiprocess.py](https://github.com/Watchful1/PushshiftDumps/blob/master/scripts/combine_folder_multiprocess.py)

Converts a folder of .zst files into decompressed .ndjson and individual subreddit specific .zst files.

b)  [to_csv.py (adapted)](https://github.com/JLS-bz/JLS-bz.github.io/blob/main/scripts/to_csv.py)

Converts and processes subreddit specific .zst files into decompressed .csv files.

  - Only information falling under the following columns are kept: subreddit, title, selftext, score, num_comments, created_utc.
  - Columns 'title' and 'selftext' are combined to create column 'post', then dropped.
  - Combines individual subreddit specific .zst files according to general topics of interest.

#### List of general topics and their respective subreddits:

  - **Autism/ADHD**: adhd_anxiety, ADHD, adhdwomen, asd, autism, AutisticWithADHD, aspergers
  - **Anxiety/Depression**: SuicideWatch, depression, depression_help, Anxiety, AnxietyDepression, Anxietyhelp, socialanxiety, HealthAnxiety, anxietysuccess
  - **COVID**: COVID19positive, covidlonghaulers
   - **Dissociation**: dpdr, dpdrhelp, Dissociation, Depersonalization, derealization, DPDRecoveryStories, OSDD, anhedonia, BrainFog, Psychosis
  - **Drugs/addiction related**: leaves, zoloft, Drugs, addiction, REDDITORSINRECOVERY, opiates, Psychonaut, benzorecovery, HPPD
  - **LGBT**: lgbt, GenderDysphoria, ftm, MtF, trans, NonBinary
  - **PTSD and Personality Disorders**: CPTSD, PTSD, ptsdrecovery, NarissisticAbuse, raisedbynarcissists, BPD, BPDlovedones, BorderlinePDisorder, BPD4BPD, BPDPartners


## Exploratory Analysis of r/dpdr with R

*2022-03-25*

#### Description of raw data:

-   Webscraped using PRAW, Reddit’s API
-   From forum about depersonalization/derealization.
-   Contains post title, post content, post date
-   Data date range: 2022-03-01 to 2022-03-27

#### Most commonly used words:

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/MostCommonWords1.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/MostCommonWords2.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

#### Most common positive and negative words:

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/CommonPosNegWords.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

#### Relationships between words: n-grams and correlations

##### Visualizing a network of bigrams:

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/NetworkBigrams.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

#### Centrality of Words

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/CentralityWords.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

## Topic Modeling of r/dpdr with TF-IDF and LDA

Large segments of code were adapted from Obedkova's {% cite obedkova2020topic -A %} tutorial, namely in the following sections: SparkNLP Pipelines, PoS-based Filtering, and Vectorization.

#### Datasets

1. **Dissociation**: dpdr, dpdrhelp, Dissociation, Depersonalization, derealization, DPDRecoveryStories, OSDD, anhedonia, BrainFog, Psychosis. 
  - Date range: 2019-11 to 2022-04
2. **dpdr**
  - Date range: 2022-12 to 2023-01

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/TM-glimpse.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>


#### SparkNLP Pipelines
##### No.1: Unigrams & PoS

First, a basic pipeline is used to transform the dataset **Dissociation** into unigrams and their respective Parts of Speech (PoS) labels. N-grams are also found, but may contain questionable combinations; this output will be further processed in the next pipeline.

This pipeline uses the following annotators:

1. **Document Assembler**: Prepares data into a format that is processable by Spark NLP. This is the entry point for every Spark NLP pipeline. (*Input*: the 'post' column in the current dataset.)
2. **Tokenizer**: Tokenizes raw text into word pieces, tokens. Identifies tokens with tokenization open standards. A few rules will help customizing it if defaults do not fit user needs.
3. **Normalizer**: Removes all dirty characters from text following a regex pattern and transforms words based on a provided dictionary.
4. **Stop Words Cleaner**: Takes a sequence of strings (e.g. the output of a Tokenizer, Normalizer, Lemmatizer, etc.) and drops all the stop words from the input sequences.
5. **NGram Generator**: Converts the input array of strings (annotatorType TOKEN) into an array of n-grams (annotatorType CHUNK).
6. **POSTagger**: Averaged Perceptron model to tag words part-of-speech.
7. **Finisher**: Converts annotation results into a format that easier to use. It is useful to extract the results from Spark NLP Pipelines.

*From the official SparkNLP website {% cite johnsnowlabs2021annotators %}.*

Contrary to commonly used NLP pipelines, a Lemmatizer Annotator is not used, in order to preserve the various uses of verb tenses. This affects generated n-grams. 

Output:

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/TM-POS.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

##### No.2: N-Grams

PoS-based filtering is used in this pipeline to remove strange word combinations and reduce vocab size.

The following pipeline is used to correspond PoS tag n-grams with word n-grams:
1. Document Assembler (*Input*: the 'finished_pos' column from the above output.)
2. Tokenizer
3. NGram Generator
4. Finisher

#### PoS-based Filtering

Unigrams: 

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/TM-POSunigram.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

Bigrams and Trigrams:

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/TM-POSngram.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

#### Vectorization: TF-IDF

Unigram and n-gram data as shown above are first combined. Then, **TF** (term frequency) vectorization is performed with **CountVectorizer** in PySpark. Finally, **IDF**(inverse document frequency) is used to lower word frequency scores.

#### Unsupervised Topic Modeling with LDA (Latent Dirichlet Allocation)

*LDA {% cite blei2003latent %} is one of the most popular topic modeling methods. Each document is made up of various words, and each topic also has various words belonging to it. The aim of LDA is to find topics a document belongs to, based on the words in it.*

*Direct quotation from Kulshrestha {% cite kulshrestha2020lda -A %}*

When performing LDA, the number of topics is fixed and predetermined. To find the optimal number of topics, LDA models with x number of topics are trained and their corresponding logLikelihood and logPerplexity calculated. This is an expensive operation to run, in terms of time and computing resources, so dataset **dpdr** was used here. 

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/likelihood.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/perplexity.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

Thus, it seems that an eye estimated optimal number of topics is NumTopic = 5.

Given that the LDA algorithm is probabilistic in nature, the following two parameters will be set for further topic modeling:

1. Max iterations = 200.
2. Seed = 123

The previous LDA was set to maxIter = 10. Increasing the number of iterations can help improve result stability, at the cost of increased computational resources.

LDA relies on a random number generator for initialization, and using a seed can help ensure consistency across multiple runs.

#### Topics based on Unigrams & N-Grams

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/chart_0_0.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/chart_0_1.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/chart_0_2.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/chart_0_3.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/chart_0_4.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

#### Topics based on Unigrams

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/chart_1_0.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/chart_1_1.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/chart_1_2.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/chart_1_3.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/chart_1_4.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

#### Topics based on N-Grams

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/chart_2_0.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/chart_2_1.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/chart_2_2.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/chart_2_3.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/chart_2_4.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

## Time-based Group Comparisons of Mental Health Disorder Discussions

Using python, time series graphs are used to visualize the frequency of posts within specific subreddit groups, in relation to time period.

**Group descriptions**:
1. **Anxiety**: Anxiety, Anxietyhelp, socialanxiety, HealthAnxiety, anxietysuccess
2. **BPD** (Borderline Personality Disorder): BPD, BPDlovedones, BorderlinePDisorder, BPD4BPD, BPDParterns
3. **Depression**: SuicideWatch, depression, depression_help
4. **Dissociation**: dpdr, dpdrhelp, Dissociation, Depersonalization, derealization, DPDRecoveryStories, OSDD, anhedonia, BrainFog
5. **NPD** (Narcissistic Personality Disorder): NarcissisticAbuse, raisedbynarcissists
6. **PTSD**: CPTSD, PTSD, Ptsdrecovery
7. **Substances**: addiction, benzorecovery, Drugs, HPPD, leaves, opiates, Psychonaut, REDDITORSINRECOVERY, zoloft

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/DIS_COMP.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/PD_COMP.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

## What is sentiment analysis? Proposed Research

When humans read documents, we are able to infer the emotional valence behind words and phrases. It can be a generally negative or positive sentiment, such as: "I'm having a terrible day" or "My day was fantastic". More complex emotions can also be understood, i.e., surprise: "Oh wow!". According to Silge and Robinson {% cite silge2017text -A %}, sentiment analysis allows one to programmatically analyse emotional sentiments within large amounts of text, quickly and without manual input or supervision. In qualitative quantitative mixed methods studies, the application of this approach within the qualitative side may prove invaluable and significantly reduce time and resources spent. 

When sentiment analysis is performed, a lexicon is used to compare and assign emotional sentiment to the text. Three general purpose lexicons are [AFINN](http://www2.imm.dtu.dk/pubdb/views/publication_details.php?id=6010), [bing](https://www.cs.uic.edu/~liub/FBS/sentiment-analysis.html), and [nrc](http://saifmohammad.com/WebPages/NRC-Emotion-Lexicon.htm). However, according to Hamilton et al. (2016), the emotional sentiment of words or phrases often varies according to the domain or context. The following figure illustrates this:

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/domain_lexicon_eg.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>
<div class="caption">
    Word sentiment differences between a sports subreddit and a subreddit dedicated to female perspectives and struggles {% cite hamilton2016inducing}.
</div>


#### Proposed Research Questions

1. Are there differences between the domain specific lexicons of various mental health subreddit groups?

2. Do the most common positive and negative words differ between each group, i.e. Dissociation, Depression, and Substance Use?

3. Among these groups, are there differences in the most common bi-grams (two word phrases) starting with the same word, such as "like" or "feel"?

4. Do the major differences in the aspect-based sentiment analysis of each group relate to differences within DSM-V criteria?

#### Description of groups of subreddits

1. **Anxiety**: Anxiety, Anxietyhelp, socialanxiety, HealthAnxiety, anxietysuccess
2. **BPD** (Borderline Personality Disorder): BPD, BPDlovedones, BorderlinePDisorder, BPD4BPD, BPDParterns
3. **Depression**: SuicideWatch, depression, depression_help
4. **Dissociation**: dpdr, dpdrhelp, Dissociation, Depersonalization, derealization, DPDRecoveryStories, OSDD, anhedonia, BrainFog
5. **NPD** (Narcissistic Personality Disorder): NarcissisticAbuse, raisedbynarcissists
6. **PTSD**: CPTSD, PTSD, Ptsdrecovery
7. **Substances**: addiction, benzorecovery, Drugs, HPPD, leaves, opiates, Psychonaut, REDDITORSINRECOVERY, zoloft

#### General To do

**End product:**

1. Bar charts showing top most common positive and negative words in a subreddit, words associated with a specific word, i.e. like, feel, not, with x axis as sentiment value.
2. Charts specific to each subreddit.
3. Charts comparing the use of similar words used in different subreddits.
4. Compare sentiment lexicons/dictionaries, domain specific vs AFINN vs bing vs NRC.

**Steps:**

1. Figure out and adapt [socialsent code](https://github.com/williamleif/socialsent) example.
2. Create domain specific sentiment lexicons/dictionaries for each subreddit group.
3. Perform sentiment analysis - looking at units beyond just words, sentiment of sentence.
4. Visualize sentiment analysis output with plotnine

#### Methodology

##### A. Creating lexicons

**Tools**: socialsent library

**Steps**:

1. Figure out min dataset size required.
2. Dataset preparation: split selected dataset into *training*, *validation*, and *testing* sets.
3. Using *socialsent*, run on dataset.

##### B. Fine-tune pretrained models

To perform sentiment analysis on a specific dataset, fine-tune the model on that dataset by providing it with its respective lexicon produced in **Step A**.

    - DeBERTa-v3-base-absa-v1.1: https://huggingface.co/yangheng/deberta-v3-base-absa-v1.1
    - DistilBERT
    - MobileBERT

**Tools**: Hugging Face Transformers

**Steps**:

1. Set up separate environment for each pretrained model.
2. Tokenization
3. Model Initialization: load model and initialize it with pre-trained weights
4. Add Classification Head: The classification head is a neural network layer that maps the output of the last layer of DeBERTa to a fixed number of output classes.
5. Training: feed model with training set and backpropagate errors to update model parameters
6. Evaluation: Evaluate performance of model on validation set. This helps fine-tune model hyperparameters to optimize performance
7. Testing: Test fine-tuned model on testing set to evaluate performance on unseen data.

##### C. Aspect Modelling in Sentiment Analysis 

Aspect Modelling in Sentiment Analysis (ABSA): 

Aspect modelling is an advanced text-analysis technique that refers to the process of breaking down the text input into aspect categories and its aspect terms and then identifying the sentiment behind each aspect in the whole text input. The two key terms in this model are:

    - Sentiments: A positive or negative review about a particular aspect
    - Aspects: the category, feature, or topic that is under observation.


**Tools**: SpaCy

**Steps**:

1. Consider the input text corpus and pre-process the dataset.
2. Create Word Embeddings of the text input. (use a fine-tuned pretrained model)
3. Aspect Terms Extraction -> Aspect Categories Model 
4. Sentiment Extraction -> Sentiment Model 
5. Combine 3 and 4 to create Aspect Based Sentiment.(OUTPUT)
