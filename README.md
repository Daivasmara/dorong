# dorong

### Install dorong via npm

```bash
$ npm i dorong -g
```

## Usage

Store Pivotal Tracker API key in your local machine:

```bash
$ dorong api-key $apiKey

# example
$ dorong api-key 213821673129836
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
