import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

export const NUM_FMT = '#,##0.##';

@Injectable()
export abstract class BaseReportService {
    protected mkFill(argb: string): ExcelJS.Fill {
        return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
    }

    protected mkBorder(): ExcelJS.Borders {
        const s: ExcelJS.BorderStyle = 'thin';
        const c = { argb: 'FFBFBFBF' };
        return {
            top: { style: s, color: c },
            bottom: { style: s, color: c },
            left: { style: s, color: c },
            right: { style: s, color: c },
            diagonal: {},
        };
    }

    protected mkFont(bold = false, size = 10, color = '000000'): Partial<ExcelJS.Font> {
        return { bold, size, color: { argb: color }, name: 'Arial' };
    }

    protected setCell(
        sheet: ExcelJS.Worksheet,
        row: number,
        col: number,
        value: ExcelJS.CellValue,
        opts: {
            fill?: string;
            bold?: boolean;
            color?: string;
            size?: number;
            align?: 'left' | 'center' | 'right';
            numFmt?: string;
            border?: boolean;
        } = {},
    ): ExcelJS.Cell {
        const cell = sheet.getCell(row, col);
        cell.value = value;
        cell.font = this.mkFont(opts.bold, opts.size ?? 10, opts.color ?? '000000');
        if (opts.fill) cell.fill = this.mkFill(opts.fill);
        cell.alignment = { horizontal: opts.align ?? 'left', vertical: 'middle' };
        if (opts.border !== false) cell.border = this.mkBorder();
        if (opts.numFmt) cell.numFmt = opts.numFmt;
        return cell;
    }

    protected fillRange(sheet: ExcelJS.Worksheet, row: number, fromCol: number, toCol: number, argb: string): void {
        for (let c = fromCol; c <= toCol; c++) {
            sheet.getCell(row, c).fill = this.mkFill(argb);
            sheet.getCell(row, c).border = this.mkBorder();
        }
    }

    protected fmtDate(d: Date): string {
        return d.toISOString().split('T')[0];
    }

    protected async streamExcel(res: Response, workbook: ExcelJS.Workbook, filename: string): Promise<void> {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        await workbook.xlsx.write(res);
        res.end();
    }
}
