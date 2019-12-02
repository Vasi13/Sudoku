using sudoku1.DAL.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace sudoku1.DAL.Repositories
{
    public class RepositoryBase
    {
        public RepositoryBase(DbContext dbContext)
        {
            DatabaseBaseContext = dbContext;
        }
        protected DbContext DatabaseBaseContext { get; set; }
        protected sudoku_solverEntities2 SudokuSolverContext
        {
            get
            {
                return DatabaseBaseContext as sudoku_solverEntities2;
            }
        }
    }
}