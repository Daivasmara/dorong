# dorong

### Install dorong via npm

```bash
$ npm i -g dorong
```

## Usage with Pivotal Tracker

Store Pivotal Tracker API key in your local machine:

```bash
$ dorong pt-api-key $apiKey

# example
$ dorong pt-api-key 213821673129836
```

Push commit to created branch:

```bash
$ dorong pt $storyId

# example
$ dorong pt 12345678
```

Get help:

```bash
$ dorong --help
```
