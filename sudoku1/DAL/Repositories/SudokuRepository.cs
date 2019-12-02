using sudoku1.DAL.Models;
using sudoku1.DAL.Repositories;
using sudoku1.DomainModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace sudoku1.Repositories
{
    public class SudokuRepository : RepositoryBase
    {
        public SudokuRepository(DbContext dbContext)
            : base(dbContext)
        {
        }

        public List<SudokuModel> GetAllSudokus()
        {
            return SudokuSolverContext.Sudokus
                .Select(s => new SudokuModel()
                {
                    SudokuId = s.SudokuId,
                    Date = s.SudokuDate,
                    Sudoku = s.SudokuArray
                }).ToList();
        }

        public SudokuModel GetSudokuById(int sudokuId)
        {
            return SudokuSolverContext.Sudokus
                .Select(s => new SudokuModel()
                {
                    SudokuId = s.SudokuId,
                    Date = s.SudokuDate,
                    Sudoku = s.SudokuArray
                }).FirstOrDefault(q => q.SudokuId == sudokuId);
        }

        public SudokuModel GetNextSudoku()
        {
            var dbSudokus = SudokuSolverContext.Sudokus.Where(q => !q.IsLoaded).ToList();
            if (dbSudokus == null || (dbSudokus != null && dbSudokus.Count == 0))
            {
                dbSudokus = SudokuSolverContext.Sudokus.ToList();
                foreach (var item in dbSudokus)
                {
                    item.IsLoaded = false;
                }
            }
            return dbSudokus != null && dbSudokus.Count > 0 ? GetRandomSudoku(dbSudokus) : null;
        }

        public SudokuModel GetRandomSudoku(List<Sudoku> dbSudokus)
        {
            var randomKeyGenerator = new Random();
            var minValue = dbSudokus.Min(q => q.SudokuId);
            var maxValue = dbSudokus.Max(q => q.SudokuId);
            var randomKey = randomKeyGenerator.Next(dbSudokus.Min(q => q.SudokuId), dbSudokus.Max(q => q.SudokuId));
            Sudoku matchedDbSudoku = null;
            do
            {
                randomKey = randomKeyGenerator.Next(minValue, maxValue);
                matchedDbSudoku = dbSudokus.Where(q => q.SudokuId == randomKey).FirstOrDefault();
            } while (matchedDbSudoku == null && dbSudokus.Count > 0);
            matchedDbSudoku.IsLoaded = true;
            return new SudokuModel()
            {
                Date = matchedDbSudoku.SudokuDate,
                Sudoku = matchedDbSudoku.SudokuArray,
                SudokuId = matchedDbSudoku.SudokuId
            };
        }

        public SudokuModel ConvertListToSudokuModel(List<List<int>> sudoku)
        {
            var convertedSudoku = new SudokuModel();
            var sudokuArray = sudoku.SelectMany(s => s).Select(s => Convert.ToByte(s)).ToArray();
            convertedSudoku.Date = System.DateTime.Now;
            convertedSudoku.Sudoku = sudokuArray;
            return convertedSudoku;
        }

        public void SaveSudoku(SudokuModel sudoku)
        {
            var dbSudoku = SudokuSolverContext.Sudokus.Where(q => q.SudokuId == sudoku.SudokuId).FirstOrDefault();
            if (dbSudoku == null)
            {
                AddSudoku(sudoku);
            }
            else
            {
                UpdateSudoku(dbSudoku, sudoku);
            }
        }

        public void AddSudoku(SudokuModel sudoku)
        {
            SudokuSolverContext.Sudokus.Add(new Sudoku()
            {
                SudokuId = sudoku.SudokuId,
                SudokuArray = sudoku.Sudoku,
                SudokuDate = sudoku.Date,
            });
        }

        public void UpdateSudoku(Sudoku dbSudoku, SudokuModel sudoku)
        {
            dbSudoku.SudokuArray = sudoku.Sudoku;
            dbSudoku.SudokuId = sudoku.SudokuId;
            dbSudoku.SudokuDate = sudoku.Date;
        }

    }
}