using sudoku1.DAL.UnitOfWork;
using sudoku1.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace sudoku1.BLL.DataServices
{
    public class SudokuDataService
    {
        public List<SudokuModel> GetAllSudokus()
        {
            using (var unitOfWork = new UnitOfWork())
            {
                return unitOfWork.SudokuRepository.GetAllSudokus();
            }
        }
        public SudokuModel GetSudokuById(int sudokuId)
        {
            using (var unitOfWork = new UnitOfWork())
            {
                return unitOfWork.SudokuRepository.GetSudokuById(sudokuId);
            }
        }
        public SudokuModel GetNextSudoku()
        {
            using (var unitOfWork = new UnitOfWork())
            {
                var sudoku = unitOfWork.SudokuRepository.GetNextSudoku();
                unitOfWork.Commit();
                return sudoku;
            }
        }
        public SudokuModel GetConvertedSudoku(List<List<int>> sudoku)
        {
            using (var unitOfWork = new UnitOfWork())
            {
                return unitOfWork.SudokuRepository.ConvertListToSudokuModel(sudoku);
            }
        }
        public void SaveSudoku(SudokuModel sudokuModel)
        {
            using (var unitOfWork = new UnitOfWork())
            {
                unitOfWork.SudokuRepository.SaveSudoku(sudokuModel);
                unitOfWork.Commit();
            }
        }
    }
}