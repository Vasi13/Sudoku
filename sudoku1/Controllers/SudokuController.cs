using sudoku1.BLL.DataServices;
using sudoku1.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace sudoku1.Controllers
{
    public class SudokuController : Controller
    {
        private SudokuDataService SudokuDataService { get; set; } = new SudokuDataService();
        // GET: Sudoku
        public ActionResult Index()
        {
            return View();
        }
        public JsonResult GetSudokuById(int sudokuId)
        {
            var t = SudokuDataService.GetSudokuById(sudokuId);
            return Json(SudokuDataService.GetSudokuById(sudokuId));
        }
        public JsonResult GetNextSudoku()
        {

            return Json(SudokuDataService.GetNextSudoku());
        }
        public JsonResult GetAllSudokus()
        {
            return Json(SudokuDataService.GetAllSudokus());
        }
        public void SaveSudoku(SudokuModel sudoku)
        {
            SudokuDataService.SaveSudoku(sudoku);

        }
        public void SaveSudokuList(List<List<int>> sudoku)
        {
            var convertedSudoku = SudokuDataService.GetConvertedSudoku(sudoku);
            SudokuDataService.SaveSudoku(convertedSudoku);
        }

    }
}