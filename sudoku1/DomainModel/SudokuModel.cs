using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace sudoku1.DomainModel
{
    public class SudokuModel
    {
        public int SudokuId { get; set; }
        public byte[] Sudoku { get; set; }
        public DateTime Date { get; set; }
    }
}