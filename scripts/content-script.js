
const getKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openai-key'], (result) => {
      if (result['openai-key']) {
        const decodedKey = atob(result['openai-key']);
        resolve(decodedKey);
      }
    });
  });
};


const generate = async (prompt) => {
  // Get your API key from storage
  const key = await getKey();
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

  console.log('------>' ,completion)
  return completion.choices.pop();
}








const extractDomEls = () => {

    const els = window.document.querySelectorAll('*');

    const lookup = [...els].reduce((acc, el) => {
        const tag = el.tagName;

        if(tag==='SCRIPT'||
      tag==='NOSCRIPT'||
    tag==='HEAD'||
  tag==='HTML'||
    tag==='META'||
    tag==='BODY'||
      tag==='[[Prototype]]'
){
          return acc;
        }


        if(tag=='DIV'||
      tag==='SPAN'
    || true ){



        if (!acc[tag]) {
            acc[tag] = {
                textNodes: [],
                tagCnt: 0
            };
        }

        acc[tag].tagCnt++;

        acc[tag].textNodes.push(el.textContent);
        }
        return acc;

    }, {});


    return lookup;
};


const lookup = extractDomEls();

let fragments = Object.entries(lookup).map(([key, value]) => {
    let line = value.textNodes.reduce((acc, el) => {

if(el){
          acc += ' ' + el;
}

        return acc;
    }, '')
if(line){
  line += `with a weight of ${value.tagCnt};`;
    //  console.log('#############',line);
}

    return line;
}).reduce((acc, el)=>{

if(acc.length <=2000){
  acc+= ' '+el

}
  return acc;
},'');
fragments=fragments.slice(0, 1250)
encodeURIComponent(fragments);

(async()=>{
  try {

      const basePromptPrefix = `create a poem out of:${fragments}`;

      console.log('#############');
    console.log(basePromptPrefix)


      const baseCompletion = await generate(basePromptPrefix);

        console.log('#############');
      console.log(basePromptPrefix)
      console.log('#############');
      console.log(baseCompletion.text)


  } catch (error) {
      console.log(error);
  }
})()
