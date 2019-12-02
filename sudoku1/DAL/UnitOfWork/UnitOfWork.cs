using sudoku1.DAL.Models;
using sudoku1.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace sudoku1.DAL.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork, IDisposable
    {
        private SudokuRepository _sudokuRepository;
        private sudoku_solverEntities2 _dbContext = new sudoku_solverEntities2();
        public SudokuRepository SudokuRepository
        {
            get
            {
                return _sudokuRepository ?? (_sudokuRepository = new SudokuRepository(_dbContext));
            }
        }
        public void Commit()
        {
            _dbContext.SaveChanges();
        }

        public void Dispose()
        {
            Dispose(true);
        }
        private bool disposedValue;
        public virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    _dbContext.Dispose();
                }
            }
            disposedValue = true;
        }
    }
}