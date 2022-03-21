# `dorong`

![demo](https://github.com/Daivasmara/dorong/blob/main/assets/demo.gif?raw=true)

## Install `dorong` via npm

```bash
$ npm i -g dorong
```

## Usage with `Pivotal Tracker`:
> 
```bash
# Store Pivotal Tracker API key in your local machine:
# NOTE: you only need to do this once
$ dorong pt-api-key 213821673129836

# Push the staged files to branch
# NOTE: it will automatically create branch and commit message based on provided Pivotal Tracker story
$ dorong pt 2137219 # story ID
```

### Misc
```bash
$ dorong --help
$ dorong --version
```
