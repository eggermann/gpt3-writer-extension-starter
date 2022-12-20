const extractDomEls = () => {

    const els = window.document.querySelectorAll('*');

    const lookup = [...els].reduce((acc, el) => {
        const tag = el.tagName;

        if (!acc[tag]) {
            acc[tag] = {
                textNodes: [],
                tagCnt: 0
            };
        }

        acc[tag].tagCnt++;

        acc[tag].textNodes.push(el.textContent);

        return acc;

    }, {});

    console.log(lookup)

    return lookup;
};


const lookup = extractDomEls();

const fragments = Object.entries(lookup).forEach(([key, value]) => {
    let line = value.textNodes.reduce((acc, el) => {
        acc += ',' + el;
        return acc;
    }, '')

    line+=` with a weight of ${weight}`

});


try {

    const basePromptPrefix = `
create me a poem with content out of fragments :${fragments}`;

    const baseCompletion = await
    generate(basePromptPrefix);

    // Let's see what we get!
    console.log('#############');
    console.log(baseCompletion.text)


} catch (error) {
    console.log(error);
}
