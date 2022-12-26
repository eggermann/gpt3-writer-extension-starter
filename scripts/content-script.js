const _ = {
    minChars: 60,
    selectors:
    //['h1', 'h2', 'h3', 'h4', 'h5', 'a', 'span', 'p'],
    //['body *'],
        ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'article', 'div'],
    taglookUp: [],
    tagCnt: {},
    getElements: () => {
        const selectorsInReadOrder = _.selectors.join(' , ');
        const elementsInReadOrder = document.querySelectorAll(selectorsInReadOrder)

        //prepare a look up to preserve doublications from nested text
        elementsInReadOrder.forEach(function (tagEl_) {
            const tagEl = tagEl_.cloneNode(true);
            const scripts = tagEl.querySelectorAll('script , style ');
            [...scripts].forEach(item => item.remove());


            const text = tagEl.textContent.trim();
            const tagName = tagEl.tagName;

            console.log(tagName, ' text:', text)
            //   tagEl.dataset.index = index;


            if (!_.tagCnt[tagName]) {
                _.tagCnt[tagName] = 0;
            }

            _.tagCnt[tagName]++;

            _.taglookUp.push({
                text,
                tagEl
            });
        });

        //sanitize text,
        //remove sub text from nesting
        _.taglookUp.forEach(item => {
            let text = item.text;
            //  console.log('item', item, text)
            const elsFromEl = item.tagEl.querySelectorAll(selectorsInReadOrder);

            [...elsFromEl].forEach(subEl => {


                for (const child of subEl.childNodes) {
                    if (child.nodeType !== Node.TEXT_NODE) {

                        child.remove()
                    }


                    const subText = subEl.textContent.trim();
                    ;
                    console.log('---------< ', subEl, subText)
                    text = text.replace(subText, '');
                }
            });
            console.log('---------> ', text)
            item.text = text;
        });

        _.taglookUp.forEach(tag => {
            let text = tag.text.replace((/  |\r\n|\n|\r/gm), ' ');

            const limit = 10;
            const textPart = Math.min(Math.max(limit, text.length), text.length);

            text = text.substr(0, textPart);

            if (text) {
                tag.text = text;
                console.log('line tex: ', tag.text)
            }

        });
    },
    generate: async (prompt) => {
        // Get your API key from storage
        const key = await _.getKey();
        const url = 'https://api.openai.com/v1/completions';

        // Call completions endpoint
        const completionResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
                model: 'text-davinci-003',
                prompt: prompt,
                max_tokens: 1250,
                temperature: 0.7,
            }),
        });

        // Select the top choice and send back
        const completion = await completionResponse.json();

        console.log('------>', completion)
        return completion.choices.pop();
    },
    getKey: () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['openai-key'], (result) => {
                if (result['openai-key']) {
                    const decodedKey = atob(result['openai-key']);
                    resolve(decodedKey);
                }
            });
        });
    },
    getPoem: async () => {

        let fragments = Object.entries(_.taglookUp).map(([key, value], index) => {
            //if (index <= 3) return '';
            const tagType = value.tagEl.tagName;
            //  console.log(_.tagCnt[tagType],'<--------',tagType)
            const weight = _.tagCnt[tagType];
            if (!value.text) {
                return '';
            }
            let line = value.text + ' ';
            //line += `  * ${weight};\n`;

            //  console.log( '*****line:', line)
            return line;
        });
        const len = Math.ceil(fragments.length / 3)
        const nA = fragments.slice(0, len);
        const nB = fragments.slice(-len);
        const nN = nB.concat(nA);
        let nText = '';

        //console.log(len,fragments,nA,nB,nN)

        while (nN.length && nText.length <= 2048) {
            let newLine = nN.pop();

            console.log('newLine', newLine);

            nText += ' ' + newLine+ ' \n';
        }

        fragments = nText;

        const basePromptPrefix =
            `create a poem in rhyming verse, a line always rhymes with the preceding line.
      The poem relates to the following content: ${fragments}`;
        console.log('**** POEM input****');
        console.log(basePromptPrefix)
        let poem = '**fail**';

        try {
            const baseCompletion = await _.generate(basePromptPrefix);
            console.log('**** POEM ****');
            console.log(baseCompletion.text)
            poem = baseCompletion.text;

        } catch (error) {
            console.log(error);
        }

        return poem;
    },
    addPoem: async () => {
        _.buttonEl.classList.add('poem__button--wait');
        let poem = await _.getPoem();
poem = poem.replace((/  |\r\n|\n|\r/gm), '<br>');
        console.log('+++++++++', poem)
        _.buttonEl.classList.add('poem__button--over');

      //  const textNode = document.insert(poem);
_.pEl.insertAdjacentHTML('afterbegin', poem);
  //_.pEl.appendChild(textNode);
        _.pEl.classList.add('poem__text--ready');

    }
};


_.getElements();
const divEl = document.createElement("div");
_.buttonEl = document.createElement("button");
_.pEl = document.createElement("p");

divEl.classList.add('poem');
_.buttonEl.classList.add('poem__button');
_.pEl.classList.add('poem__text');

_.buttonEl.innerHTML = "Poemize it! ";
//pEl.innerHTML = 'Poem:<br>';

_.buttonEl.addEventListener('click', _.addPoem)
divEl.appendChild(_.buttonEl);
divEl.appendChild(_.pEl);

document.body.appendChild(divEl);
