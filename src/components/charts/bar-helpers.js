// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export function formatNumber(x) {
    const o = Math.floor(Math.log10(x));
    if (o >= 6) {
        return Math.round((x / Math.pow(10, 6)) * 10) / 10.0 + 'M';
    } else if (o >= 3) {
        return Math.round((x / Math.pow(10, 3)) * 10) / 10.0 + 'k';
    }
    return x;
}

export function barChart(element, allBars, opts) {
    if (opts === undefined) opts = {};

    const plot = element;
    const barMargin =
        plot.clientWidth > 600
            ? opts.largeBarMargin || 2
            : opts.smallBargMargin || 0;
    const nLegends = opts.xTicks !== undefined ? opts.xTicks.length : 0;
    const bottomMargin = opts.bottomMargin || 30 + 10 * nLegends;
    const topMargin = 20;
    const leftMargin = opts.leftMargin || (plot.clientWidth > 600 ? 40 : 10);
    const n = allBars[0].length;
    const nHorizonalTicks = Math.min(plot.clientWidth / 100, n / 10);
    const container = document.createElement('div');

    // we let the container expand freely horizontally
    container.style.width = '100%';

    // we insert the container so we can measure its dimensions
    if (plot.hasChildNodes()) plot.replaceChild(container, plot.childNodes[0]);
    else plot.appendChild(container);

    const plotWidth = container.clientWidth - leftMargin - n * barMargin;
    const plotHeight =
        opts.plotHeight ||
        Math.min(300, Math.ceil(container.clientWidth / 1.5));
    const barWidth = Math.max(1, Math.min(40, plotWidth / n));
    const innerWidth = (barWidth + barMargin) * n;

    // we set the height that was calculated above
    container.style.height = plotHeight + bottomMargin + topMargin + 'px';

    let max = 0;
    if (opts.relative) max = 100;
    else
        for (let j = 0; j < allBars.length; j++) {
            const bars = allBars[j];
            for (let i = 0; i < n; i++) {
                if (opts.ref !== undefined && opts.ref[i] > max)
                    max = opts.ref[i];
                if (bars[i] > max) max = bars[i];
            }
        }

    const lastXTick = [];
    for (let li = 0; li < nLegends; li++) lastXTick.push(0);
    for (let i = 0; i < n; i++) {
        const x = leftMargin + i * (barWidth + barMargin);
        const width =
            barWidth +
            (x - Math.floor(x) > 0.5 && barMargin === 0 ? 1 : 0) +
            'px';
        if (opts.ref !== undefined) {
            const refElement = document.createElement('span');
            refElement.style.width = width;
            if (opts.relative) refElement.style.height = plotHeight + 'px';
            else
                refElement.style.height =
                    Math.floor((opts.ref[i] / max) * plotHeight) + 'px';

            refElement.style.position = 'absolute';
            refElement.style.left = x + 'px';
            refElement.style.bottom = bottomMargin + 'px';
            refElement.style.display = 'block';
            refElement.className = 'kip-refbar';
            refElement.title =
                opts.refTitles !== undefined ? opts.refTitles[i] : undefined;
            refElement.style.margin = barMargin + 'px';
            container.appendChild(refElement);
        }
        if (i % Math.floor(n / nHorizonalTicks) === 0) {
            for (let li = 0; li < nLegends; li++) {
                // we add a legend
                const legendElement = document.createElement('span');
                legendElement.style.position = 'absolute';
                legendElement.style.display = 'block';
                legendElement.style.textAlign = 'center';
                legendElement.innerText =
                    opts.xTicks !== undefined ? opts.xTicks[li][i] : i;
                const left = Math.floor(
                    -(legendElement.clientWidth - barWidth) / 2 +
                        leftMargin +
                        i * (barWidth + barMargin)
                );
                container.appendChild(legendElement);
                legendElement.style.left =
                    Math.floor(left - legendElement.clientWidth / 2) + 'px';
                legendElement.style.bottom =
                    bottomMargin - legendElement.clientHeight * (li + 1) + 'px';
                // if there's not enough space for a tick we remove it again...
                if (lastXTick[li] !== undefined && left - 20 <= lastXTick[li])
                    container.removeChild(legendElement);
                lastXTick[li] = left + legendElement.clientWidth;
            }
        }
        let y = 0;
        for (let j = 0; j < allBars.length; j++) {
            const bars = allBars[j];
            let className;
            if (opts.classNames !== undefined) className = opts.classNames[j];
            const h = bars[i];
            const ref = opts.relative ? opts.ref[i] : max;
            let hh = Math.ceil((h / ref) * plotHeight);
            const yy = Math.floor((y / ref) * plotHeight);
            if (hh + yy > plotHeight) hh -= hh + yy - plotHeight;
            const element = document.createElement('span');
            element.style.marginLeft = -(barWidth + barMargin) + 'px';
            element.style.width = width;
            element.style.height = hh + 'px';
            element.style.position = 'absolute';
            element.style.left = x + 'px';
            element.title =
                opts.titles !== undefined ? opts.titles[j][i] : undefined;
            element.style.bottom = bottomMargin + yy + 'px';
            element.style.display = 'block';
            element.style.zIndex = 2;
            element.className = 'kip-bar';
            if (className !== undefined) element.className += ' ' + className;
            element.style.margin = barMargin + 'px';
            container.appendChild(element);
            y += h;
        }
    }
    const nVerticalTicks = max > 0 ? 5 : 0;
    for (let i = 1; i < nVerticalTicks + 1; i++) {
        const y = (i / nVerticalTicks) * max;
        const lv = Math.floor(Math.log10(y));
        const v = Math.round(y / Math.pow(10, lv)) * Math.pow(10, lv);
        const ly = bottomMargin + (v / max) * plotHeight;
        if (plot.clientWidth > 600) {
            const legendElement = document.createElement('span');
            legendElement.style.position = 'absolute';
            legendElement.style.horizontalAnchor = 'right';
            legendElement.style.display = 'block';
            legendElement.innerText = formatNumber(v);
            container.appendChild(legendElement);

            legendElement.style.left =
                leftMargin - legendElement.clientWidth - 2 + 'px';
            legendElement.style.bottom =
                ly - legendElement.clientHeight / 3 + 'px';
        }

        const gridElement = document.createElement('span');
        gridElement.className = 'kip-grid';
        gridElement.style.left = leftMargin + 'px';
        gridElement.style.bottom = ly + 'px';
        gridElement.style.width = innerWidth + 'px';

        container.appendChild(gridElement);
    }
}
