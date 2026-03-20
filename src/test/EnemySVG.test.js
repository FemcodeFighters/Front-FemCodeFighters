import { describe, test, expect } from "vitest";
import { generateEnemySVG } from "../components/molecules/enemySVG";
import React from 'react';

describe("generateEnemySVG", () => {
    test("devuelve SVG válido para HTML", () => {
        const svg = generateEnemySVG("HTML");
        expect(svg).toContain("<svg");
        expect(svg).toContain("</svg>");
    });

    test("devuelve SVG válido para todos los tipos", () => {
        const tipos = [
            "HTML",
            "CSS",
            "JAVASCRIPT",
            "REACT",
            "JAVA",
            "SPRINGBOOT",
        ];
        tipos.forEach((tipo) => {
            const svg = generateEnemySVG(tipo);
            expect(svg).toContain("<svg");
            expect(svg).toContain("</svg>");
        });
    });

    test("cae a JAVASCRIPT si el tipo no existe", () => {
        const svgInvalido = generateEnemySVG("PYTHON");
        const svgJS = generateEnemySVG("JAVASCRIPT");
        expect(svgInvalido).toBe(svgJS);
    });

    test("cada tipo devuelve un SVG diferente", () => {
        const html = generateEnemySVG("HTML");
        const css = generateEnemySVG("CSS");
        const js = generateEnemySVG("JAVASCRIPT");
        expect(html).not.toBe(css);
        expect(css).not.toBe(js);
        expect(html).not.toBe(js);
    });

    test("devuelve un string", () => {
        expect(typeof generateEnemySVG("REACT")).toBe("string");
    });
});
